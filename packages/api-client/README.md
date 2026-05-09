# @troott/api-client

Typed HTTP client for `apps/api` (mounted at `/api/v1`). See `ARCHITECTURE.md` for channel and storage conventions.

## Construction

```typescript
import Troott, { createWebLocalStorageAdapter, normalizeApiBaseUrl } from '@troott/api-client';

const api = new Troott(normalizeApiBaseUrl('http://localhost:3000'), {
    channel: 'web',
    tokenStorage: createWebLocalStorageAdapter('accessToken'),
    onUnauthorized: () => {
        /* redirect or clear session */
    },
});

await api.auth.loginUser({ email, password });
await api.discovery.getHome();
```

`troottAPIClient()` returns the last constructed instance (use a single app-wide singleton).

## React Query

```typescript
import { TroottQueryProvider, useDiscoveryHome } from '@troott/api-client';

// <TroottQueryProvider><App /></TroottQueryProvider>
const q = useDiscoveryHome();
```

## DTOs

`import type { X } from '@troott/api-client/dto'`

Types are defined next to API modules under `src/api/**`; the barrel is `src/dto-index.ts`. For paths, naming, barrel coverage, and an agent checklist to keep docs in sync, see **[`docs/models/README.md`](./docs/models/README.md)**.

## Tests

`pnpm --filter @troott/api-client test`
