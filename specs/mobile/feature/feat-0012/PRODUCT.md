# feat-0012: Mobile build hygiene and runtime hardening

## Summary

Remediates **known TypeScript failures**, **silent UI bugs**, and **library/favorites edge cases** discovered during feat-0011 context work and `tsc` audit of `apps/mobile`. Goal: clean `pnpm exec tsc --noEmit` for app source, predictable auth button loading state, safe MMKV idempotency typing, and documented favorites vs library sync behavior.

Complements [feat-0010](../feat-0010/PRODUCT.md) (state ownership), [feat-0011](../feat-0011/PRODUCT.md) (context slices), [feat-0007](../feat-0007/PRODUCT.md) (library), [feat-0001](../feat-0001/PRODUCT.md) (auth).

## Problem

1. **`tsc --noEmit` fails** on orphan web seed data, MMKV type mismatch, auth `Button` prop mismatch, and a missing type import on `Transaction.model.tsx`.
2. **Auth Continue buttons** pass `loading` but `Button` only supports `isLoading` — pending state never shows.
3. **Favorites hook** `useToggleFavoriteWithSync` uses Zustand `getState()` inside a hook body — non-reactive; unused but misleading.
4. **Library sync** (`useSyncLibraryFavoriteMutation`) throws when listener has no library row; local favorite toggle (Zustand) works but server sync can fail without product rules.
5. **Context provider errors** are possible if hooks run outside `TroottProviders` — document guardrails; no code path should call `useContextType` before root layout mounts providers.

## Non-goals

- New listener features (playlists UI redesign, search ranking).
- API schema changes for library (unless 404 handling requires a dedicated `POST` create-library — see open question).
- Web app fixes (separate specs under `specs/web`).
- Full removal of all dead code in `apps/mobile` — only items blocking `tsc` or active flows.

## Figma

Not applicable.

## Consumer

Mobile engineers running CI/typecheck, auth forms, library/favorites hooks, and MMKV services.

---

## A. TypeScript and build (`tsc` clean)

| ID | Issue | Product rule | Acceptance |
|----|-------|--------------|------------|
| **UC-F12-01** | `_data/seed.tsx` imports web-only `interfaces.util` | File must not break mobile `tsc` | Either delete, move under `docs/`, or exclude from `tsconfig` if non-runtime |
| **UC-F12-02** | `idempotent.tsx` MMKV vs `MmkvLike` | Idempotency storage must type-check against `getMMKV()` | `tsc` passes on `api/services/idempotent.tsx` |
| **UC-F12-03** | `login-form` / `register-form` `loading` prop | Use **`isLoading`** on shared `Button` | Spinner/disabled state visible while mutation pending |
| **UC-F12-04** | `Transaction.model.tsx` `IDebitCard` | Import from `models/_api-types.ts` (same as `Listener.model`) | `tsc` passes on `Transaction.model.tsx` |

**Gate:** `cd apps/mobile && pnpm exec tsc --noEmit` exits 0 for application source (document any intentional excludes in TECH).

---

## B. Auth UX (feat-0001)

| ID | Use case | Expected |
|----|----------|----------|
| **UC-F12-10** | User submits login while request in flight | Button shows loading; double-submit prevented |
| **UC-F12-11** | User submits register while request in flight | Same as login |

---

## C. Favorites and library (feat-0007, feat-0010)

### Ownership (unchanged)

| State | Owner |
|-------|--------|
| Favorite sermon ids (optimistic UI) | `engine/state/favorite-sermon-ids-store.ts` (Zustand + MMKV) |
| Library document (server) | TanStack via `useUserLibraryQuery` |
| Session user id | `userContext` ([feat-0011](../feat-0011/PRODUCT.md)) |

### Product rules

| ID | Rule |
|----|------|
| **UC-F12-20** | **Default UI path** (search card, mini-player, `useAddFavorite` / `useRemoveFavorite`) may update **local** favorites only until server sync is explicitly wired at call sites. |
| **UC-F12-21** | When **server sync** runs (`useSyncLibraryFavoriteMutation`), missing library must **not** crash the app — handle 404 / “library not found” with toast + optional local rollback (same pattern as `useToggleFavoriteWithSync` revert). |
| **UC-F12-22** | `useToggleFavoriteWithSync` must subscribe to the Zustand store (selector hooks), not `getState()` in render, if kept; otherwise remove as dead code. |
| **UC-F12-23** | Library queries (`useUserLibraryQuery`, `usePlaylistsQuery`) stay **`enabled` only when `userContext.user.id` exists** — never force `enabled: true` before session hydration. |
| **UC-F12-24** | After login / `SessionHydrator`, `user.id` is set before library tab relies on queries (feat-0011 session sync). |

### Sync strategy (target)

```text
User taps favorite
  → optimistic: favorite-sermon-ids-store
  → optional: PUT library items[].flags.favourite
  → on failure: revert store + user-visible error
  → on success: invalidate libraryKeys.user(userId)
```

**Default:** implement **UC-F12-21** before enabling sync on sermon-card / mini-player hearts (or gate sync behind `library != null`).

---

## D. Context guardrails (feat-0011)

| ID | Rule |
|----|------|
| **UC-F12-30** | All `useContextType` / `useUserContext` usage remains under `TroottProviders` in `app/_layout.tsx` (after `PersistQueryClientProvider`). |
| **UC-F12-31** | Feature hooks (`useLibrary`, `usePlaylist`, `useAuth`) import from `@/context` barrel where possible. |
| **UC-F12-32** | No revival of `stores/register-store` or Zustand under `context/`. |

---

## E. MMKV and idempotency

| ID | Rule |
|----|------|
| **UC-F12-40** | `createMmkvIdempotencyStorage` accepts the same MMKV instance as Zustand persist (`getMMKV()`). |
| **UC-F12-41** | Adapter may widen `MmkvLike.set` to accept `ArrayBuffer` **or** wrap `getMMKV()` in a thin adapter — no `as any` at call site without comment. |

---

## Behavior summary

1. Mobile app **typechecks cleanly**.
2. Auth forms show **correct loading** on submit.
3. Favorites: **local-first** UI stays stable; server sync is **graceful** when library missing.
4. Context: **no provider violations** on tab screens under root layout.
5. Dead / misleading hooks cleaned up or fixed.

## Open questions

1. **Auto-create listener library on first favorite?** **Default:** no — show toast “Library not ready”; rely on signup/listener provisioning API if it exists; document in TECH after API audit.
2. **Delete `_data/seed.tsx` vs exclude?** **Default:** delete or move to `docs/` if unused (grep shows no imports).
3. **Wire server sync on all favorite buttons?** **Default:** phase 2 after 404 handling; keep local Zustand for v1 hearts.

## Related

- [feat-0010 PRODUCT](../feat-0010/PRODUCT.md)
- [feat-0011 PRODUCT](../feat-0011/PRODUCT.md)
- [feat-0007 PRODUCT](../feat-0007/PRODUCT.md)
- [feat-0001 PRODUCT](../feat-0001/PRODUCT.md)
- [`09 - context.md`](../../09%20-%20context.md)
