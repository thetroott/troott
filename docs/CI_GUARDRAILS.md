# CI guardrails (recommended)

**Platform spec:** [`specs/platform/feature/feat-0001/PRODUCT.md`](../specs/platform/feature/feat-0001/PRODUCT.md) — full CI/CD (GitHub Actions + Coolify + EAS). Reference implementation: Pacepard monorepo at `/Users/pro/Documents/ProjectPacepard/pacepard`.

Add pipeline steps:

1. `pnpm exec tsc -b tsconfig.workspace.json`
2. `pnpm lint`
3. `pnpm --filter @troott/api-client test`
4. Ban patterns (adjust for your linter):
   - `@react-native-async-storage/async-storage` in `apps/mobile`
   - Direct imports of deprecated app API folders once migration completes (`apps/web/src/api` excluding `clients/troott.ts`)

Drift checks for future OpenAPI codegen: see `docs/codegen-followup.md`.
