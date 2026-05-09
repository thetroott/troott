# ADR 0003: Shared `@troott/api-client` and `@troott/state`

## Status

Accepted

## Context

Multiple clients (web, mobile, player web, desktop) duplicated API wrappers and carried forked state types from a non-Troott product. Mobile persistence must use MMKV only (no AsyncStorage).

## Decision

- **HTTP SDK:** Single package `@troott/api-client` exporting `new Troott(baseUrl, options?)` with resource namespaces aligned to `apps/api` v1 routers (`/api/v1/...`). Optional runtime options cover channel headers (`web` | `mobile` | `player-web` | `desktop` | `creator`), locale, token storage, `onUnauthorized`, and telemetry.
- **State:** Single package `@troott/state` keeps React Context + reducers (`AppState`, `UserState`). Domain slices map to sermons, ministers, listeners, playlists, library, discovery, billing references, etc. Non-Troott domains were removed.
- **Initialization:** Each app constructs one `Troott` instance at startup (web: `apps/web/src/api/clients/troott.ts`; mobile: `apps/mobile/api/config.tsx`), registering the global accessor `troottAPIClient()`.

## Consequences

- Apps depend on workspace packages via `workspace:*`.
- Legacy web hooks that still reference removed APIs (`workspace`, `talent`) receive structured deprecation responses from compatibility stubs until those hooks are deleted.
- OpenAPI-driven codegen remains a documented follow-up (see `docs/codegen-followup.md`).

## Related

- ADR 0001 (single profile DTO)
- Planned ADR 0002 (home rails / discovery), referenced by discovery client paths.
