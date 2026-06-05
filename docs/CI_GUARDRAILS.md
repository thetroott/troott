# CI guardrails (recommended)

**Platform spec:** [`specs/platform/feature/feat-0001/PRODUCT.md`](../specs/platform/feature/feat-0001/PRODUCT.md) — full CI/CD (GitHub Actions + Coolify + EAS). Follow-up: [feat-0003](../specs/platform/feature/feat-0003/PRODUCT.md) (API route params + Turbo env).

Reference implementation: Pacepard monorepo at `/Users/pro/Documents/ProjectPacepard/pacepard`.

## Local CI parity (run before push)

```bash
pnpm install --frozen-lockfile
pnpm typecheck:workspace
pnpm typecheck:api
rm -rf apps/api/dist && pnpm --filter @troott/api build
pnpm build:ci
pnpm lint
pnpm test:ci
(cd apps/mobile && pnpm dlx expo-doctor@latest)
```

## Pipeline steps

1. `pnpm typecheck:workspace` and `pnpm typecheck:api`
2. `pnpm --filter @troott/api build` (emit build — same `tsc` as Deploy)
3. `pnpm lint`
4. `pnpm test:ci`
5. Ban patterns (adjust for your linter):
   - `@react-native-async-storage/async-storage` in `apps/mobile`
   - Direct imports of deprecated app API folders once migration completes (`apps/web/src/api` excluding `clients/troott.ts`)

Drift checks for future OpenAPI codegen: see `docs/codegen-followup.md`.
