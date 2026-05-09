# Conventions and relation to `apps/api`

## File placement

- **Pattern:** One API module folder contains the HTTP wrapper (e.g. `user.ts`) and optional **`*.dto.ts`** beside it.
- **Root:** `packages/api-client/src/api/` mirrors coarse domains: `authentication/`, `users/`, `core/`, `platform/`, `notifications/`, `payments/`.

Example layout:

```text
packages/api-client/src/api/users/user/
  user.ts       # UserAPI class / methods
  user.dto.ts   # TroottUser, etc.
```

## Naming

- **Interfaces:** PascalCase with a **`DTO`** suffix where the type represents an API payload or resource (`LoginDTO`, `SermonDTO`). Supporting shapes may use `I` prefix (`IPlanPricing`) consistent with existing payment types.
- **Type aliases:** Used for unions or `Pick`-based views (`ProfileDTO`, `SermonCardDTO`, `RailId`).
- **Enums:** Shared enumerations live in `packages/api-client/src/utils/enums.ts` and are imported into DTO files as needed (not duplicated per module).

## Backend alignment

- DTOs are **maintained manually** (see `packages/api-client/ARCHITECTURE.md`: OpenAPI/codegen is a follow-up). When `apps/api` changes a module’s contract, update the matching `*.dto.ts` and any dependent types (e.g. `discovery.dto.ts` importing `sermon.dto.ts`).
- **`ProfileDTO`** explicitly documents parity with the backend profile discriminant; treat similar comments as the source of truth for cross-repo mapping.

## API classes vs DTOs

- **`*.ts` modules** (no `.dto`) export default classes (`AuthAPI`, `SermonAPI`, …) that call `paths` and return `IAPIResponse<T>`; method signatures should use or infer types from adjacent `*.dto.ts` files where applicable.
- Not every API submodule has a DTO file yet; empty stubs (`listener.dto.ts`, `minster.dto.ts`) reserve the filename for future types.
