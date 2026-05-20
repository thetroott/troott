# ADR 0001: Web API client layout

## Status

Accepted

## Context

The Vite/React web app (`apps/web`) talks to `apps/api` v1 over HTTP. The client lives under `apps/web/src/api` only. It is independent of `apps/mobile/api` (separate env, paths, and bootstrap).

We need one place to construct the client, one facade for domain APIs, and consistent imports across features.

## Decision

### Layer split

1. **`apps/web/src/api/clients/troott.ts`** — Defines `Troott` / `TroottAPIClient` and `troottAPIClient()`. Must not read `import.meta.env`.
2. **`apps/web/src/api/config.tsx`** — Only module that reads `VITE_APP_API_URL`, builds the `/api/v1` base URL, and calls `new Troott(...)`. Imported once at startup (`main.tsx`: `import '@/api/config'`).
3. **`apps/web/src/api/clients/*.ts`** — Domain APIs; routes from `../core/paths`; receive `AxiosService` via constructor.
4. **`apps/web/src/api/core/paths.ts`** — Route constants (relative to axios base URL `/api/v1`).

### Consumption

Feature code uses a single entry:

```ts
import api from '@/api/config';

await api.auth.loginUser(payload);
await api.sermon.getSermonById(id);
```

`troottAPIClient()` remains available from `@/api/config` for legacy call sites but new code should prefer `api`.

### Forbidden

- Constructing `new Troott(...)` outside `config.tsx`.
- Reading `import.meta.env` inside client classes.
- Importing `apps/mobile/api` from web (or the reverse).
- Domain-specific aliases (`sermonApi`, `authApi`) exported from `config.tsx` unless explicitly added to this ADR.

## Consequences

- Tests and Storybook can construct `new Troott(baseUrl)` with any base URL without Vite env.
- All HTTP traffic shares one `AxiosService` instance and auth interceptors.
- Path changes stay in `core/paths.ts` and domain clients.

## Related

- Backend routes: `apps/api` v1 routers
- Mobile client: `apps/mobile/api` (not governed by this ADR)
