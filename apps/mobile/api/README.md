# Troott Mobile API layer

## Architecture (three layers)

**API client method → hook → component.** No extra `lib/*-map` or `parse*` helpers for feature data.

See [`.cursor/skills/troott-mobile-three-layer/SKILL.md`](../../.cursor/skills/troott-mobile-three-layer/SKILL.md).

## Supported patterns

- **HTTP entry:** `import api from '@/api/api'` — singleton `TroottAPIClient` with domain services (`api.auth`, `api.user`, `api.listener`, `api.library`, `api.playlist`, `api.share`, `api.discovery`, `api.search`, `api.sermon`, etc.).
- **Paths:** `@/api/config/path` (synced with web `paths.ts`).
- **Enums:** `@troott/api/enums` and client enums in `@/api/types` (`QueuingType`, `StreamingQuality`).
- **Hooks:** `@/api/hooks/app/*` call `api.*`, handle `res.error`, return `res.data`; session updates go through `@/context` (`GET_LOGGEDIN_USER`, `SET_LISTENER_ONBOARDING`, …).
- **Context:** `TroottProviders` in `@/context/providers` — user + app reducers; `useContextType()` from `@/context/apps/app.context`.
- **Tokens:** MMKV / secure storage only — not in zustand session stores.
- **Player:** `@/api/hooks/player/*` and `engine/` stay separate from REST `usePlayback`.

## Not supported

- `@/state/app-state`, `useAuthStore` session slice, per-domain singletons (`authService`, `usersService`).
- Raw `httpClient` in feature hooks (use `api.<domain>`).
- New `lib/` files for one-off parse/map/normalize of API responses (use hook `queryFn` or component `useMemo`).
- New `apps/mobile/utils/` — removed; use `api/`, hooks, components, or allowed `lib/state` / `lib/preferences` only.
- `api/utils/*`, `api-response.util.ts`, `sync-session-to-context.ts`, `map-api-user.ts` — removed; session sync and envelope toasts live in `useUser.ts` / `useAuth.ts`.
- `apps/mobile/types/` — removed; import DTOs from `@/api/dtos/*` directly (e.g. `sermon.dto`, `network.dto`, `queue-client.dto`).

## Layout

```
api/
  api.ts              # singleton facade
  query-keys.ts       # TanStack Query keys
  clients/            # BaseService domain clients
  config/             # env, paths, api-call
  hooks/app/          # domain React Query hooks
context/              # UserState, AppState, providers
```
