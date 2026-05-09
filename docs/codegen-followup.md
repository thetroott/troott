# OpenAPI / Swagger codegen follow-up (not implemented)

## Goal

Generate DTOs and optional client methods from an authoritative OpenAPI document produced by `apps/api`.

## Spec source

- Generate or maintain `openapi.yaml` from Express route registration (tooling TBD: `tsoa`, manual export, or runtime introspection). Owner: API platform team.

## Output layout

- Proposed: `packages/api-client/src/generated/` for types + thin wrappers that delegate to `AxiosService.call`.

## Commands

- Document `pnpm openapi:generate` at repo root once the generator is chosen (openapi-typescript, orval, etc.).

## CI drift policy

- Fail CI when generated output differs from committed artifacts (`git diff --exit-code`) after running the generator in CI.

## Relationship to hand-written client

- Until codegen lands, hand-maintained resources in `packages/api-client/src/api/**` remain canonical; generated output should converge module-by-module.
