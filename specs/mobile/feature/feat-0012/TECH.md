# feat-0012: Tech Spec — Mobile build hygiene and runtime hardening

## Context

See [`PRODUCT.md`](./PRODUCT.md). Audit source: `pnpm exec tsc --noEmit` in `apps/mobile` and runtime review of context + library + favorites (feat-0011 implementation pass).

---

## Failure inventory (current)

| File | Error | Root cause |
|------|-------|------------|
| `apps/mobile/_data/seed.tsx` | `Cannot find module '../utils/interfaces.util'`; `sidebarRoutes` | Web/admin seed copied into mobile; **not imported** anywhere |
| `apps/mobile/api/services/idempotent.tsx` | `MMKV` not assignable to `MmkvLike` | `Mmkv.set` allows `ArrayBuffer`; `MmkvLike.set` uses `Uint8Array` only |
| `apps/mobile/components/features/auth/forms/login-form.tsx` | `loading` not on `ButtonProps` | Should be `isLoading` |
| `apps/mobile/components/features/auth/forms/register-form.tsx` | Same | Same |
| `apps/mobile/models/Transaction.model.tsx` | `Cannot find name 'IDebitCard'` | Missing `import type { IDebitCard } from './_api-types'` |

---

## Implementation tasks

### 1. `_data/seed.tsx` (UC-F12-01)

| Option | Action |
|--------|--------|
| **A (preferred)** | Delete `apps/mobile/_data/seed.tsx` if unused |
| **B** | Move to `apps/mobile/docs/seed-reference.tsx` and exclude from `tsconfig` `include` |
| **C** | Fix imports to mobile types only if product needs seed on native |

Verify: `rg "_data/seed" apps/mobile` → no imports.

### 2. MMKV idempotency types (UC-F12-02, UC-F12-40–41)

**File:** `apps/mobile/api/services/idempotency-mmkv.ts`

Widen `MmkvLike`:

```ts
set(key: string, value: string | boolean | number | Uint8Array | ArrayBuffer): void;
```

**Or** adapter in `idempotent.tsx`:

```ts
function asMmkvLike(mmkv: ReturnType<typeof getMMKV>): MmkvLike {
  return {
    getString: (k) => mmkv.getString(k),
    set: (k, v) => mmkv.set(k, v as string | boolean | number),
    delete: (k) => mmkv.delete(k),
  };
}
```

Pick one approach; no duplicate definitions.

### 3. Auth buttons (UC-F12-03, UC-F12-10–11)

| File | Change |
|------|--------|
| `components/features/auth/forms/login-form.tsx` | `loading={...}` → `isLoading={LoginMutation.isPending}` |
| `components/features/auth/forms/register-form.tsx` | `loading={...}` → `isLoading={RegisterMutation.isPending}` |

Reference: `components/ui/button.tsx` — `isLoading?: boolean`.

### 4. Transaction model (UC-F12-04)

**File:** `apps/mobile/models/Transaction.model.tsx`

```ts
import type { IDebitCard } from './_api-types';
```

Mirror `Listener.model.tsx` / `Subscription.model.tsx`.

### 5. Favorites / library hooks (UC-F12-20–24)

| File | Change |
|------|--------|
| `api/hooks/app/useFavorites.ts` | **Fix or remove** `useToggleFavoriteWithSync`: use `useFavoriteSermonIdsStore((s) => s.isFavorite)` and `(s) => s.toggleFavorite` inside hook; expose `isPending` from mutation |
| `api/hooks/app/useFavorites.ts` | In `useSyncLibraryFavoriteMutation`, treat library 404 like `useLibrary.ts` `parseLibraryResponse` (return null / throw typed error caught by caller) |
| `api/hooks/app/useLibrary.ts` | Keep `enabled: enabled && !!userId`; document in code comment |
| Call sites | `sermon-card.tsx`, `mini-player.tsx` — **no change** for v1 if sync not wired; optional: call fixed `useToggleFavoriteWithSync` in phase 2 |

**404 handling sketch:**

```ts
const libRes = await api.library.getLibraryByUser(userId);
if (libRes.error) {
  const msg = String(libRes.message ?? '').toLowerCase();
  if (msg.includes('library not found')) {
    throw new LibraryNotFoundError(); // or return { ok: false, reason: 'no_library' }
  }
  throw new Error(libRes.message || 'Request failed');
}
```

UI: `toast.error` + revert Zustand toggle in `toggle` wrapper.

### 6. Context imports (UC-F12-30–32)

Optional consistency pass (no behavior change):

| From | To |
|------|-----|
| `@/context/apps/app.context` | `@/context` for `useContextType` |

Files already using context correctly under `_layout.tsx` → `TroottProviders`.

**Do not** add `useContextType` to modules rendered before `TroottProviders` (splash-only tree is OK without context).

### 7. API audit (library provisioning)

Before auto-create (open question):

| Check | Location |
|-------|----------|
| Listener signup creates library? | `apps/api` listener service / registration |
| Mobile calls `createLibrary`? | `api/clients/library.ts` |

Document result in TECH after implementation; wire **UC-F12-21** accordingly.

---

## Validation

```bash
cd apps/mobile && pnpm exec tsc --noEmit
```

| Manual test | Steps | Expected |
|-------------|-------|----------|
| Login loading | Submit login | Button `isLoading` visible |
| Register loading | Submit register | Same |
| Favorite (local) | Heart on sermon card | Toggles without redbox |
| Favorite (sync, if enabled) | Heart with no library | Toast + revert, no crash |
| Library tab | Open before/after login | No query throw; empty/loading until `user.id` |
| Cold start | Kill app, reopen logged in | `SessionHydrator` fills user; library queries enable |

---

## File map (PRODUCT mapping)

| UC range | Primary files |
|----------|----------------|
| UC-F12-01 | `_data/seed.tsx`, `tsconfig.json` |
| UC-F12-02, 40–41 | `idempotency-mmkv.ts`, `idempotent.tsx` |
| UC-F12-03, 10–11 | `login-form.tsx`, `register-form.tsx` |
| UC-F12-04 | `Transaction.model.tsx` |
| UC-F12-20–24 | `useFavorites.ts`, `useLibrary.ts`, `favorite-sermon-ids-store.ts`, sermon-card, mini-player |
| UC-F12-30–32 | `app/_layout.tsx`, `context/providers.tsx`, `context/index.ts` |

---

## Dependencies

| Spec | Relationship |
|------|----------------|
| feat-0011 | Context must remain valid; no new slice files |
| feat-0010 | Favorites stay Zustand; library stays TanStack |
| feat-0007 | Library API paths unchanged unless provisioning added |
| feat-0001 | Auth forms only prop rename + loading UX |

---

## Done definition

- [x] `tsc --noEmit` passes in `apps/mobile`
- [x] Auth `isLoading` on login/register forms
- [x] `useToggleFavoriteWithSync` uses Zustand selectors + toast on `LibraryNotFoundError`
- [x] `useSyncLibraryFavoriteMutation` throws `LibraryNotFoundError` for missing library
- [x] `_data/seed.tsx` removed (unused web copy)
- [x] README feat-0012 row added
