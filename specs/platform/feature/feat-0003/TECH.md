# feat-0003: Tech — API route params and Turbo env (CI follow-up)

## Context

GitHub Actions run on `master` at `a91226d` (feat-0002 commits). CI **Validate** and Deploy **Build for deployment** both fail on the same TypeScript errors. See [PRODUCT.md](./PRODUCT.md).

**Failing commands (normative repro):**

```bash
pnpm install --frozen-lockfile
pnpm typecheck:api          # CI Validate
pnpm --filter @troott/api build   # Deploy @troott/api#build (tsc --noEmit false)
pnpm build:ci               # turbo build api + web + website
pnpm lint                   # surfaces turbo/no-undeclared-env-vars warnings
```

---

## Failure inventory

| Annotation | Job | Likely source | Fix priority |
| ---------- | --- | ------------- | ------------ |
| `string \| string[]` → `string` (×3) | Validate, Deploy build | `studio.controller.ts` invite routes | P0 |
| `turbo/no-undeclared-env-vars` (×10) | Validate (lint via turbo) | `jest.config.ts`, `aws.config.ts` | P1 |
| Security exit 1 | Security | `pnpm audit --prod` and/or job config | P1 |
| CI success exit 1 | CI success | Downstream of Validate | — |
| Node 20 action deprecation | Multiple | `actions/*@v4` | P2 |

---

## 1. Express route params — remaining TypeScript errors

### Symptom

```
Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
```

Reported **three times** — matches three handlers in `studio.controller.ts` that were **not** updated in feat-0002:

| Handler | Lines (approx.) | Params passed to service |
| ------- | --------------- | ------------------------ |
| `deleteStudioInvite` | 212–221 | `studioId`, `inviteId` → `cancelInvite()` |
| `acceptStudioInvite` | 242–248 | `studioId`, `inviteId` → `acceptInvite()` |
| `rejectStudioInvite` | 268–277 | `studioId`, `inviteId` → `rejectInvite()` |

Current code:

```typescript
const { id: studioId, inviteId } = req.params;
await studioService.cancelInvite(userId, studioId, inviteId);
```

`studio.service.ts` signatures require `string` for `studioId` and `inviteId`.

### Fix (P0)

**Option A (recommended):** Add helper in `apps/api/src/utils/helpers.util.ts`:

```typescript
export function resolveRouteParam(
    value: string | string[] | undefined,
): string {
    if (value == null) return '';
    return Array.isArray(value) ? value[0] : value;
}
```

Apply in `studio.controller.ts`:

```typescript
const studioId = resolveRouteParam(req.params.id);
const inviteId = resolveRouteParam(req.params.inviteId);
```

**Option B:** Inline `Array.isArray` pattern (already used elsewhere in the same file).

### Repo-wide audit (P0)

Run and fix any site that passes `req.params.*` to `string`-typed functions without narrowing:

| File | Pattern | Status |
| ---- | ------- | ------ |
| `controllers/core/studio.controller.ts` | `getStudio`, `patchStudio`, `postStudioInvite` | Fixed in feat-0002 |
| `controllers/core/studio.controller.ts` | invite delete/accept/reject | **Open** |
| `views/preview/preview.router.ts` | `template`, `category` in `res.render` paths | Review — may need `resolveRouteParam` |
| `middlewares/checkPermission.mdw.ts` | `req.params[options.ownerParam]` | Review |
| Other controllers | Mostly narrowed or `String(...)` wrapped | Verify via `tsc` |

**Verification:**

```bash
pnpm typecheck:api
pnpm --filter @troott/api build
```

Both must exit 0 before merge.

### Why local may pass but CI fails

- Incremental `tsc` cache or stale `dist/` can hide errors locally.
- CI always runs clean `pnpm install --frozen-lockfile` then full emit build.
- **Normative local check:** `rm -rf apps/api/dist && pnpm --filter @troott/api build`.

---

## 2. Turbo undeclared environment variables

### Symptom (Validate lint annotations)

```
NODE_ENV is not listed as a dependency in turbo.json
AWS_REGION is not listed as a dependency in turbo.json
...
```

Sources:

| File | Variables read at module load |
| ---- | ----------------------------- |
| `apps/api/jest.config.ts` | `NODE_ENV`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET`, `CLOUDFRONT_STORAGE_URL` |
| `apps/api/src/configs/aws.config.ts` | `NODE_ENV`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, (+ bucket vars per env) |

Rule: `turbo/no-undeclared-env-vars` in `configs/eslint/base.js` (warn; `eslint-plugin-only-warn` prevents lint exit 1 today).

### Fix (P1)

Update `turbo.json`:

```json
{
  "globalEnv": [
    "ENABLE_SEEDING",
    "SUPERADMIN_EMAIL",
    "SUPERADMIN_PASSWORD",
    "SUPERADMIN_FIRSTNAME",
    "SUPERADMIN_LASTNAME",
    "NODE_ENV"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "env": [
        "AWS_REGION",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_STORAGE_BUCKET",
        "AWS_ORIGINALS_BUCKET",
        "AWS_PLAYBACK_BUCKET",
        "AWS_BUCKET_STAGING",
        "CLOUDFRONT_STORAGE_URL",
        "VITE_APP_API_URL",
        "VITE_APP_ENVIRONMENT",
        "NEXT_PUBLIC_APP_API_URL",
        "NEXT_PUBLIC_APP_ENVIRONMENT"
      ],
      "outputs": ["..."]
    },
    "test": {
      "env": [
        "AWS_REGION",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_STORAGE_BUCKET",
        "CLOUDFRONT_STORAGE_URL",
        "JWT_SECRET"
      ],
      "inputs": ["**/*.{ts,tsx,js,jsx}"]
    }
  }
}
```

Adjust bucket key names to match `aws.config.ts` and `example.env`. Deploy workflow already passes `VITE_*` and `NEXT_PUBLIC_*` at build time — declare them so Turbo cache hashes correctly.

**Optional:** Run `npx @turbo/codemod migrate-env-var-dependencies` and reconcile with Troott env names.

**Verify:**

```bash
pnpm lint
pnpm build:ci
```

No `turbo/no-undeclared-env-vars` for the listed keys.

---

## 3. Security job exit 1

### Current workflow (`.github/workflows/ci.yml`)

| Step | Policy |
| ---- | ------ |
| `pnpm audit --prod` | `continue-on-error: true` |
| TruffleHog (PR / push) | `continue-on-error: true` |

### Expected behavior

Job should **succeed** when only these steps fail. If the job still exits 1:

1. Confirm no step lacks `continue-on-error` (setup/install failure).
2. Confirm TruffleHog `if:` conditions — on some pushes `github.event.before` is all zeros; push step is skipped (OK).
3. Consider explicit job summary step that always exits 0 when failures are warn-only.

### Recommended hardening (P1)

```yaml
security:
  steps:
    # ... existing steps ...
    - name: Security summary
      if: always()
      run: echo "Security checks completed (audit and TruffleHog are warn-only)."
```

Document in PRODUCT: audit findings are informational until Dependabot policy is defined.

---

## 4. CI / Deploy parity matrix

| Check | CI `validate` | CI `build` | Deploy `build` | Local command |
| ----- | ------------- | ---------- | -------------- | ------------- |
| API types | `pnpm typecheck:api` | via `build:ci` | via `build:ci` | both commands |
| API emit | — | `tsc` in turbo build | same | `pnpm --filter @troott/api build` |
| Turbo env | lint warnings | build strict env | build + deploy env vars | `pnpm build:ci` |

**Add to feat-0003 PR description / CI_GUARDRAILS:**

```bash
pnpm install --frozen-lockfile
pnpm typecheck:api
pnpm --filter @troott/api build
pnpm build:ci
pnpm lint
pnpm test:ci
(cd apps/mobile && pnpm dlx expo-doctor@latest)
```

---

## 5. Node.js 20 action deprecation (P2)

Same as feat-0002 §9. Non-blocking. Track in platform backlog:

- Bump `actions/checkout`, `actions/setup-node`, `pnpm/action-setup` when Node 24–ready, or set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` after smoke test.

---

## Implementation checklist

### P0 — unblock CI and Deploy build

- [x] Add `resolveRouteParam()` to `helpers.util.ts`
- [x] Fix `deleteStudioInvite`, `acceptStudioInvite`, `rejectStudioInvite` in `studio.controller.ts`
- [x] Run repo-wide `req.params` audit; fix `preview.router.ts` if `tsc` reports errors
- [x] Verify `pnpm typecheck:api` and `pnpm --filter @troott/api build` exit 0

### P1 — hygiene

- [x] Extend `turbo.json` `globalEnv` and task `env` arrays
- [x] Harden Security job with summary step; confirm exit 0 on warn-only failures
- [x] Update `docs/CI_GUARDRAILS.md` with parity script above

### P2 — deferred

- [ ] GitHub Actions Node 24 migration
- [ ] `pnpm audit` triage / `--audit-level` policy

---

## Files touched (expected)

| Path | Change |
| ---- | ------ |
| `apps/api/src/utils/helpers.util.ts` | `resolveRouteParam()` |
| `apps/api/src/controllers/core/studio.controller.ts` | Invite route param narrowing |
| `apps/api/src/views/preview/preview.router.ts` | Optional param narrowing |
| `turbo.json` | `globalEnv` + `tasks.*.env` |
| `.github/workflows/ci.yml` | Security summary step (optional) |
| `docs/CI_GUARDRAILS.md` | Parity commands |

---

## Changelog

| Date | Note |
| ---- | ---- |
| 2026-06-03 | Spec from CI/Deploy failure on `master` @ `a91226d` after feat-0002 |
