# feat-0011: React context slices (user, auth, app, session)

## Summary

Defines the **listener mobile Context layer** under `apps/mobile/context/`: four slices (**user**, **auth**, **app**, **session**) that follow the **web four-file contract** ([`appContext`](../../../../apps/web/src/context/app/appContext.tsx), [`appReducer`](../../../../apps/web/src/context/app/appReducer.tsx), [`appState`](../../../../apps/web/src/context/app/appState.tsx), [`types`](../../../../apps/web/src/context/app/types.ts)). Hooks live on `*State.tsx` only. Complements [`09 - context.md`](../../09%20-%20context.md), [feat-0010](../feat-0010/PRODUCT.md) (what must *not* live in Context), and feature specs that consume `userContext` ([feat-0006](../feat-0006/PRODUCT.md), [feat-0007](../feat-0007/PRODUCT.md), [feat-0009](../feat-0009/PRODUCT.md), [feat-0001](../feat-0001/PRODUCT.md)).

## Problem

Library, search, profile, and auth features assume `useContextType()` works, but without a slice spec engineers add invalid files (`useFoo.ts`, Zustand under `context/`) and break review consistency with web.

## Non-goals

- Playback queue, search results, library rows, playlist entities (TanStack + engine).
- Share overlay, NetInfo, persisted settings (Zustand under `lib/`).
- Web minister/creator/studio/admin/draft/upload slices on native.

## Figma

Not applicable.

## Consumer

Any code under `apps/mobile/context/` and hooks importing `@/context/*`. Feature teams read this before adding slice fields or new folders.

## Global file contract

1. Each slice folder **`context/{slice}/`** contains **only**: `{slice}Context.tsx`, `{slice}Reducer.tsx`, `{slice}State.tsx`, `types.ts` (names match web; `authReducer` uses `.tsx` on mobile today).
2. **All** `use{Slice}*` hooks for that slice are exported from `{slice}State.tsx` — no standalone `use*.ts` in slice folders.
3. **Invalid** inside any `context/{slice}/`: Zustand stores, `reducer-types.ts`, sync/API helpers, feature UI, extra hook files.
4. **Allowed at `context/` root:** `providers.tsx`, `types.ts` (shared action strings), `index.ts`, `apps/app.context.tsx`.
5. **Allowed in `context/session/` only:** `SessionHydrator.tsx` (web parity; not a fifth core file).
6. **Allowed outside `context/`:** `api/services/sync-session-to-context.ts`, `lib/state/*`, `lib/preferences/*`.

## Provider stack

7. `TroottProviders` nests **`UserState` → `AuthState` → `AppState` → `SessionState`**, then **`SessionHydrator`**, then children.
8. `PersistQueryClientProvider` wraps `TroottProviders` in `app/_layout.tsx`.
9. Hooks used outside the stack throw a descriptive error.

## User slice (`context/user/`)

10. Holds `user`, `userType`, `listener`, `loading`, `loader`, `message`.
11. `setResource(type, data)` supports `GET_LOGGEDIN_USER`, `GET_LISTENER`, and related constants from `context/types.ts`.
12. `SET_LISTENER_ONBOARDING` updates onboard fields on user and listener for tab guards.
13. Login, activate, and `syncSessionToContext` write the user slice and align TanStack `queryKeys.auth.user()` where applicable.
14. Search, library, profile, and playlist hooks use `userContext` for **identity only**, not list payloads.

## Auth slice (`context/auth/`)

15. `authContext.register` owns the register / enter-email wizard (form fields, touched, password strength, `reset`).
16. `authContext.forgotPassword` owns forgot-password steps (email, OTP, errors, resend countdown).
17. Screens use `useRegisterAuth()` and `useForgotPasswordAuth()` from `authState.tsx` — no Zustand auth form stores.
18. `useAuth` resets register state after successful registration.

## App slice (`context/app/`)

19. Holds `isFirstTimeUser`, `loading`, `loader`, `message`.
20. `setFirstTimeUser(false)` persists MMKV key `isFirstTime`.
21. App loading is independent of user and auth loading reducers.

## Session slice (`context/session/`)

22. No `sessionReducer.tsx` (web parity); `sessionState.tsx` uses `useState` for `isHydratingSession`.
23. `useSession()` exposes `refreshSession({ force? })` and hydration flag.
24. `refreshSession` calls `syncSessionToContext` when token and user id exist.
25. `SessionHydrator` triggers one cold-start refresh (same responsibility as web `SessionHydrator`).

## Access API

26. **`useContextType()`** in `context/apps/app.context.tsx` returns `{ userContext, authContext, appContext }` — default for feature hooks.
27. **`usePlaybackDispatch`** / **`useQueueDispatch`** in the same file are **no-ops** on mobile (engine owns queue).
28. Public barrel: `context/index.ts` re-exports providers, slice hooks, `SessionHydrator`, `syncSessionToContext`.

## Related docs

- [`TECH.md`](./TECH.md) — file map and consumers
- State boundaries: [feat-0010](../feat-0010/PRODUCT.md)
- Inventory: [`09 - context.md`](../../09%20-%20context.md)
