# Entry points and imports

## Package root (`@troott/api-client`)

- **File:** `packages/api-client/src/index.ts`
- **Exports:** `Troott` / `troottAPIClient`, API namespace classes (`AuthAPI`, `UserAPI`, …), React Query helpers, storage/idempotency factories, shared enums/utils, and **`export * from './dto-index'`** so all DTO symbols are also available from the root entry.

## DTO subpath (`@troott/api-client/dto`)

- **File:** `packages/api-client/src/dto-index.ts`
- **Package wiring:** `packages/api-client/package.json` → `"exports"."./dto"` → `./src/dto-index.ts` (types: `./dist/dto-index.d.ts` after build).

### Consumer imports

```typescript
import type { LoginDTO, TroottUser } from '@troott/api-client/dto';
```

Equivalent when tree-shaking from the main entry:

```typescript
import type { LoginDTO } from '@troott/api-client';
```

Prefer **`@troott/api-client/dto`** when call sites should depend only on types (clearer intent; matches the dedicated export condition).

## Transport types (not domain DTO barrels)

These live outside `dto-index.ts` but shape API calls and responses:

- **File:** `packages/api-client/src/api/_base/types.ts`
- **Examples:** `CallApiDTO`, `IAPIResponse<T>`, `IListQuery`, `TroottAxiosOptions`, `ChannelType`

Import from the package root:

```typescript
import type { IAPIResponse, IListQuery } from '@troott/api-client';
```
