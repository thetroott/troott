# Mobile React context (listener app)

**Slice contract (implementation):** [`feature/feat-0011/PRODUCT.md`](feature/feat-0011/PRODUCT.md) · [`feature/feat-0011/TECH.md`](feature/feat-0011/TECH.md)

**State ownership (what not to put in Context):** [`feature/feat-0010/PRODUCT.md`](feature/feat-0010/PRODUCT.md) · [`feature/feat-0010/TECH.md`](feature/feat-0010/TECH.md)

**Web reference:** [`apps/web/src/context/app`](../../apps/web/src/context/app) — `appContext.tsx`, `appReducer.tsx`, `appState.tsx`, `types.ts`.

---

## Purpose

React Context holds **session identity**, **auth wizards**, **app shell**, and **session refresh**. Library, search, profile, and playlists use Context for **who is signed in** only; lists live in TanStack ([feat-0010](feature/feat-0010/PRODUCT.md)).

---

## Slice file contract (feat-0011)

| Slice | Required files | Hooks on `*State.tsx` |
| ----- | -------------- | --------------------- |
| `user/` | `userContext`, `userReducer`, `userState`, `types` | `useUserContext` |
| `auth/` | `authContext`, `authReducer`, `authState`, `types` | `useAuthContext`, `useRegisterAuth`, `useForgotPasswordAuth` |
| `app/` | `appContext`, `appReducer`, `appState`, `types` | `useAppContext` |
| `AuthSessionRouting.tsx` | Deep link pending + post-auth routing (feat-0004) |

**Invalid in slice folders:** `use*.ts`, Zustand, `reducer-types.ts`, sync helpers.

---

## Provider stack

```
TroottProviders
  └── UserState → AuthState → AppState → AuthSessionRouting → children
```

---

## Access API

| Hook | File |
| ---- | ---- |
| `useContextType()` | `context/apps/app.context.tsx` |
| `useUserContext()` | `context/user/userState.tsx` |
| `useAppContext()` | `context/app/appState.tsx` |
| `useRegisterAuth()` / `useForgotPasswordAuth()` | `context/auth/authState.tsx` |
| `useSession()` | `context/session/sessionState.tsx` |

---

## Related feature specs

| Topic | Spec |
| ----- | ---- |
| Context slices | [feat-0011](feature/feat-0011/PRODUCT.md) |
| Layer boundaries | [feat-0010](feature/feat-0010/PRODUCT.md) |
| Auth | [feat-0001](feature/feat-0001/PRODUCT.md) |
| Search | [feat-0006](feature/feat-0006/PRODUCT.md) |
| Library & playlists | [feat-0007](feature/feat-0007/PRODUCT.md) |
| Profile | [feat-0009](feature/feat-0009/PRODUCT.md) |
| Playback | [feat-0004](feature/feat-0004/PRODUCT.md) |
