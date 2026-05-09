# DTO and model reference (`@troott/api-client`)

Explicit layout for **hand-written TypeScript types** that mirror `apps/api` request and response shapes. Sources live next to their API module files under `packages/api-client/src/api/` (not in a single `models/` tree). The barrel `packages/api-client/src/dto-index.ts` powers the `@troott/api-client/dto` subpath export.

This folder mirrors the intent of **`packages/state/docs/context/`**: short markdown files, tables, and **full paths** to source files so agents and humans can verify quickly.

**Note:** Repo root **`docs/models/*.model.tsx`** is a separate, legacy pattern (large interface stubs). It does **not** describe `@troott/api-client` DTOs.

| Doc | What it is |
|-----|------------|
| [entry-points.md](./entry-points.md) | `src/index.ts`, `src/dto-index.ts`, package `exports`, import patterns. |
| [dto-inventory.md](./dto-inventory.md) | Every `*.dto.ts` path, barrel coverage, cross-file references. |
| [conventions.md](./conventions.md) | Naming, co-location with API classes, relation to `apps/api` modules. |
| [PROMPT.md](./PROMPT.md) | Copy-paste prompt for maintaining these docs. |
