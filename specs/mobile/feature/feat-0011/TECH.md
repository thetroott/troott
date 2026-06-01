# feat-0011: Tech Spec — React context slices

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implementation root: `apps/mobile/context`. Web style reference: `apps/web/src/context/{slice}/` (four files per slice).

---

## Directory layout

```
apps/mobile/context/
  providers.tsx
  types.ts                    # GET_LOGGEDIN_USER, REGISTER_*, FORGOT_*, SET_LOADING, …
  index.ts
  apps/
    app.context.tsx           # useContextType, usePlaybackDispatch, useQueueDispatch
  user/
    userContext.tsx
    userReducer.tsx
    userState.tsx               # UserState, useUserContext
    types.ts
  auth/
    authContext.tsx
    authReducer.tsx
    authState.tsx               # AuthState, useAuthContext, useRegisterAuth, useForgotPasswordAuth
    types.ts
  app/
    appContext.tsx
    appReducer.tsx
    appState.tsx                # AppState, useAppContext
    types.ts
  AuthSessionRouting.tsx        # auth routing + deep link pending (feat-0004; no session slice)
```

### Removed per feat-0004

| Path | Replaced by |
| ---- | ----------- |
| `context/session/*` | Deleted — token-only auth; lazy `useCurrentUserQuery` |
| `api/services/sync-session-to-context.ts` | `queryClient.invalidateQueries` after auth/onboarding mutations |
| `lib/state/network-store.ts` | Zustand |
| `lib/state/share-flow.ts` | Zustand |
| `lib/preferences/*` | Zustand persist |
| `engine/state/*` | Playback / favorites |

---

## Invalid files (PR reject)

| Pattern | Fix |
| ------- | --- |
| `context/{slice}/use*.ts` | Move hook to `{slice}State.tsx` |
| `context/{slice}/*-store.ts` | `lib/state` or `lib/preferences` |
| `context/{slice}/reducer-types.ts` | Merge into `types.ts` |
| `context/settings/*` | `lib/preferences/*` |
| `context/network-store.ts` | `lib/state/network-store.ts` |

---

## Provider mount

| Concern | File |
| ------- | ---- |
| Stack | `context/providers.tsx` |
| Root layout | `app/_layout.tsx` |

---

## User slice

| File | Role |
| ---- | ---- |
| `userContext.tsx` | `createContext<IUserContextValue \| null>` |
| `userReducer.tsx` | Pure reducer |
| `userState.tsx` | Provider + `useUserContext` |
| `types.ts` | `IUserContextValue`, `UserAction`, `SessionUser` |

### Actions (`context/types.ts`)

`GET_LOGGEDIN_USER`, `GET_LISTENER`, `SET_USER`, `SET_USERTYPE`, `SET_LISTENER`, `SET_LISTENER_ONBOARDING`, `SET_LOADING`, `SET_LOADER`, `UNSET_LOADING`

### Feature consumers

| Feature | Import / usage |
| ------- | -------------- |
| feat-0001 Auth | `useContextType().userContext`, `setResource` on login |
| feat-0002 Onboarding | `useOnboardingGuard` → `user.onboard` |
| feat-0006 Search | `sermon-card.tsx`, `query.tsx` |
| feat-0007 Library | `useLibrary`, `usePlaylist` |
| feat-0009 Profile | `use-profile-identity.ts` |

---

## Auth slice

| File | Role |
| ---- | ---- |
| `authContext.tsx` | `createContext<IAuthContextValue \| null>` |
| `authReducer.tsx` | Register + forgot branches; `initialAuthState` |
| `authState.tsx` | Provider + auth hooks |
| `types.ts` | `AuthAction`, `IAuthContextValue`, slice types |

### Actions (`context/types.ts`)

`REGISTER_SET_EMAIL`, `REGISTER_SET_FIELD`, `REGISTER_RESET`, `FORGOT_SET_STEP`, `FORGOT_RESET`, …

### UI consumers

| File | Hook |
| ---- | ---- |
| `enter-email-form.tsx`, `register-form.tsx`, `verify-email-otp.tsx` | `useRegisterAuth` |
| `forgot-password-form.tsx` | `useForgotPasswordAuth` |
| `api/hooks/app/useAuth.ts` | `useRegisterAuth`, `useForgotPasswordAuth` |

---

## App slice

| File | Role |
| ---- | ---- |
| `appContext.tsx` | `createContext<IAppContextValue \| null>` |
| `appReducer.tsx` | `SET_IS_FIRST_TIME_USER`, loading |
| `appState.tsx` | Provider + `useAppContext` |
| `types.ts` | `IAppContextValue`, `AppAction` |

| Behavior | Code |
| -------- | ---- |
| First-time user | MMKV `isFirstTime` in `appState.tsx` |

Web equivalent: `apps/web/src/context/app/*` (search collection on web; mobile app slice is smaller).

---

## Session (removed — feat-0004)

Mobile no longer ships a `context/session/` slice. Auth persistence is **token-only** (MMKV + `X-New-Token` reissue). Profile hydration uses lazy TanStack queries (`useCurrentUserQuery`) and mutation-time `invalidateQueries` — not cold-start `refreshSession`.

Web still has `apps/web/src/context/session/` (`SessionHydrator`) — out of scope for mobile feat-0004.

---

## Aggregator (`apps/app.context.tsx`)

| Export | Notes |
| ------ | ----- |
| `useContextType` | `{ userContext, authContext, appContext }` |
| `usePlaybackDispatch` | No-op |
| `useQueueDispatch` | No-op |

Web: `apps/web/src/hooks/shared/useContextType.tsx` (user + app only on web portal).

---

## Barrel (`context/index.ts`)

`TroottProviders`, `useContextType`, `useUserContext`, `useAppContext`, `useAuthContext`, `useRegisterAuth`, `useForgotPasswordAuth`.

---

## Session sync matrix

| Event | User context | Query |
| ----- | ------------ | ----- |
| Login | `setResource(GET_LOGGEDIN_USER, …)` | `queryKeys.auth.user()` |
| Cold start | Lazy `useCurrentUserQuery` when UI mounts | `users.me()`, `listener.me()` |
| Onboarding POST | Context from mutation payload | `invalidateQueries` for `users.me` / `listener.me` |
| Fetch me | `useCurrentUserQuery` | `users.me()` |

---

## Web parity

| Web slice | Mobile |
| --------- | ------ |
| `user/` (4 files) | `context/user/` (4 files) |
| `app/` (4 files) | `context/app/` (4 files) |
| `session/` (+ hydrator) | **Removed** (feat-0004); web retains session hydrator |
| `auth/` | **Mobile only** (native wizards) |
| `minister/`, `studio/`, … | Absent |

---

## PRODUCT mapping

| Behaviors | Files |
| --------- | ----- |
| 1–6 | Slice folders + invalid list |
| 7–9 | `providers.tsx`, `_layout.tsx` |
| 10–14 | `user/*`, feature hooks |
| 15–18 | `auth/*`, auth forms |
| 19–21 | `app/*` |
| 22–25 | feat-0004: no session slice; `AuthSessionRouting` in `context/` |
| 26–28 | `app.context.tsx`, `index.ts` |

---

## Validation

| Check | Command / action |
| ----- | ---------------- |
| Four files per slice | `ls context/user context/auth context/app` |
| No orphan hooks | `rg "context/.*/use" apps/mobile/context` → empty |
| Provider order | User → Auth → App → AuthSessionRouting in `providers.tsx` |
| Implemented | `apps/mobile/context/*` + barrel `@/context`; legacy `stores/*` auth removed |

## Implementation status

| Area | Status |
| ---- | ------ |
| Slice folders (user, auth, app) | Done |
| `TroottProviders` + `PersistQueryClientProvider` in `_layout.tsx` | Done |
| Session slice removed (feat-0004) | Done |
| Auth forms → `useRegisterAuth` / `useForgotPasswordAuth` via `@/context` | Done |
| `useAuth` register `reset()` on success; TanStack `auth.user` + `users.me` on login | Done |
| `useCurrentUserQuery` hydrates Context + `queryKeys.auth.user()` | Done |
| Deprecated `useRegisterStore` / `useForgotPasswordStore` aliases | Removed |
