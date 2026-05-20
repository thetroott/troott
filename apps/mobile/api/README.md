# Troott Mobile API layer

## Supported patterns

- **HTTP entry:** `import api from '@/api/api'` — singleton `TroottAPIClient` with domain services (`api.auth`, `api.user`, `api.listener`, `api.library`, `api.playlist`, `api.share`, `api.discovery`, `api.search`, `api.sermon`, etc.).
- **Paths:** `@/api/config/path` (synced with web `paths.ts`).
- **Enums:** `@troott/api/enums` re-exported from `@/utils/enums.util` (do not duplicate API domain enums locally).
- **Hooks:** `@/api/hooks/app/*` use `api.*` + TanStack Query; session updates go through `@/context` (`GET_LOGGEDIN_USER`, `SET_LISTENER_ONBOARDING`, …).
- **Context:** `TroottProviders` in `@/context/providers` — user + app reducers; `useContextType()` from `@/context/apps/useContextType`.
- **Tokens:** MMKV / secure storage only — not in zustand session stores.
- **Player:** `@/api/hooks/player/*` and `engine/` stay separate from REST `usePlayback`.

## Not supported

- `@/state/app-state`, `useAuthStore` session slice, per-domain singletons (`authService`, `usersService`).
- Raw `httpClient` in feature hooks (use `api.<domain>`).

## Layout

```
api/
  api.ts              # singleton facade
  clients/            # BaseService domain clients
  config/             # env, paths, api-call
  hooks/app/          # domain React Query hooks
  utils/query-keys.ts
context/              # UserState, AppState, providers
```
