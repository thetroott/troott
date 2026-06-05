# feat-0002: Tech — CI/CD pipeline remediation

## Context

See [PRODUCT.md](./PRODUCT.md). Remediate failures observed on a `master` push after feat-0001 workflows landed.

**Workflow files:**

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/actions/setup-monorepo/action.yml`

**Reference (same cache-action pattern, same TruffleHog pitfall):** Pacepard `.github/workflows/ci.yml` — do not copy `turborepo/cache-action@v1` verbatim; action repo is unavailable.

---

## Failure inventory (reproduced locally)

Run from repo root after `pnpm install --frozen-lockfile`:

| CI job | Local command | Status (2026-06-03) | Root cause |
| ------ | ------------- | ------------------- | ---------- |
| Validate (lint) | `pnpm lint` | **FAIL** | `@troott/website` — ESLint rule `@typescript-eslint/indent` removed in `typescript-eslint` v8 |
| Validate (typecheck) | `pnpm typecheck:workspace` | PASS | Website `tsc --noEmit` clean |
| Validate (typecheck API) | `pnpm typecheck:api` | PASS locally | CI annotations show `string \| string[]` in Express handlers — enforce after param helper |
| Build | `pnpm build:ci` | PASS locally | CI fails **before** build: `uses: turborepo/cache-action@v1` → repository not found |
| Expo doctor | `pnpm dlx expo-doctor@latest` (cwd `apps/mobile`) | **FAIL** | Invalid `android.label`; 7 Expo packages behind SDK 54 patch set |
| Test | `pnpm test:ci` | **FAIL** | 9 API suites — stale imports, jest instrumentation (`test-exclude`) |
| Security | `pnpm audit --prod` | exit 1 (152 vulns) | Transitive deps; step should remain warn-only |
| Security | TruffleHog | BASE === HEAD on push | `base: default_branch` + `head: HEAD` on single-commit push |
| CI success | aggregator | **FAIL** | Expected when validate/build/mobile fail |
| Deploy | `master` → production | **FAIL** | GitHub Environment `production` deployment branch rules exclude `master` |

---

## Remediation by area

### 1. Website ESLint — `@typescript-eslint/indent`

**Error:**

```
Key "@typescript-eslint/indent": Could not find "indent" in plugin "@typescript-eslint".
```

**File:** `configs/eslint/next.js` (lines 47–49)

**Fix:**

- Remove `@typescript-eslint/indent` rule (deprecated/removed in typescript-eslint v8).
- Keep core `indent` rule and/or rely on Prettier (`eslint-config-prettier` already applied).
- Verify: `pnpm --filter @troott/website lint`.

**Follow-up (non-blocking):** Migrate `next lint` → `eslint .` per Next.js 16 deprecation message.

---

### 2. Express route params — `string | string[]`

**CI annotations (Validate):** five TypeScript errors — argument/type `string | string[]` not assignable to `string`.

**Known offenders (narrow or use shared helper):**

| File | Lines | Pattern |
| ---- | ----- | ------- |
| `apps/api/src/controllers/core/studio.controller.ts` | 66, 149, 176 | `req.params.id` passed to `getStudioById` / `updateStudio` / DTO `studioId` |

**Fix pattern (match existing controllers):**

```typescript
const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
```

Or add `resolveRouteParam(req.params.id)` in `apps/api/src/utils/helpers.util.ts` and use consistently.

**CI policy change:**

- Remove `continue-on-error: true` from **Typecheck API** step in `ci.yml` once clean.

---

### 3. Build — invalid `turborepo/cache-action@v1`

**Error:** `Unable to resolve action turborepo/cache-action, repository not found`

**Affected steps:**

- `.github/workflows/ci.yml` — job `build`, step "Setup Turborepo cache"
- `.github/workflows/deploy.yml` — job `build`, same step

**Fix:**

1. **Delete** the `turborepo/cache-action@v1` step from both workflows.
2. Keep existing env-based remote cache:

```yaml
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

3. Optional later: `actions/cache` for `.turbo` if remote cache token absent — not required for green CI.

**Verify:** CI build job runs `pnpm build:ci` and uploads artifacts.

---

### 4. Expo doctor — mobile config and dependencies

**Check 1 — schema**

```
Field: android - should NOT have additional property 'label'.
```

**File:** `apps/mobile/app.json` — remove `expo.android.label` (invalid in SDK 54 schema). Display name already set via `expo.name`, iOS `CFBundleDisplayName`, etc.

**Check 2 — package versions**

| Package | Expected (doctor) | Found |
| ------- | ----------------- | ----- |
| expo | ~54.0.35 | 54.0.33 |
| expo-asset | ~12.0.13 | 12.0.12 |
| expo-file-system | ~19.0.23 | 19.0.22 |
| expo-image-picker | ~17.0.11 | 17.0.10 |
| expo-linking | ~8.0.12 | 8.0.11 |
| expo-notifications | ~0.32.17 | 0.32.16 |
| expo-router | ~6.0.24 | 6.0.23 |

**Fix:**

```bash
cd apps/mobile && pnpm exec expo install --check
# accept aligned patch bumps; commit lockfile + package.json
```

Also align root `package.json` `dependencies.expo` if workspace hoists conflict.

**Verify:** `pnpm dlx expo-doctor@latest` in `apps/mobile` → 18/18 checks passed.

---

### 5. API tests — `pnpm test:ci`

**Current:** 9 failed suites, 2 passed (11 total).

| Suite | Failure mode | Action |
| ----- | ------------ | ------ |
| `test/unit/core/sermon.router-order.test.ts` | Import `src/modules/core/sermon/sermon.router` — **module removed** | Point to `src/routes/sermon.router.ts` or delete if redundant |
| `test/unit/core/plan-free-seed.test.ts` | jest `test-exclude` / `babel-plugin-istanbul` instrumentation | Fix `jest.config.ts` `collectCoverage` / `testPathIgnorePatterns` or mock at boundary |
| `test/unit/utils/helpers.storage-url.test.ts` | Same instrumentation error on import | Same as above |
| `test/unit/configs/topic.seed.test.ts` | Same instrumentation error | Same as above |
| `test/unit/mappers/auth.mapper.test.ts` | Mock / import order (`TypeError: original argument`) | Fix jest mock hoisting; align with `auth.mapper` exports |
| `test/unit/mappers/sermon.mapper.image.test.ts` | Test logic / fixture drift | Update fixtures after mapper changes |
| `test/unit/services/sermon-access.test.ts` | Deleted util path | Rewrite against current access policy module |
| `test/unit/services/user.service.test.ts` | Service API drift | Update mocks for seed/persona changes |
| `test/unit/services/recommendation.service.test.ts` | Service API drift | Update mocks |

**Target:** `pnpm --filter @troott/api test:ci` → 0 failed suites.

**CI note:** `test` job uses `continue-on-error: true` today — remove once green so regressions block merges.

---

### 6. Security job

#### TruffleHog — empty scan on push

On `push` to `master` with a single new commit, `base: ${{ github.event.repository.default_branch }}` and `head: HEAD` can resolve to the **same** commit.

**Fix in `ci.yml`:**

```yaml
- name: TruffleHog secret scan
  if: github.event_name == 'pull_request'
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.pull_request.base.sha }}
    head: ${{ github.event.pull_request.head.sha }}
  continue-on-error: true

- name: TruffleHog secret scan (push)
  if: github.event_name == 'push' && github.event.before != '0000000000000000000000000000000000000000'
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.before }}
    head: ${{ github.sha }}
  continue-on-error: true
```

Increase validate checkout `fetch-depth` to `0` if TruffleHog needs history on shallow clones.

#### `pnpm audit --prod`

152 vulnerabilities (includes critical/high via `firebase-admin` tree). **Phase 1:** keep `continue-on-error: true`. Document triage in feat-0002 follow-up or dependabot policy.

Ensure the **Security job** does not fail when both steps use `continue-on-error` (if job still fails, check for missing `if:` on TruffleHog causing action resolution error).

---

### 7. CI success aggregator

**File:** `.github/workflows/ci.yml` — job `ci-success`

```yaml
needs: [validate, build, mobile]
```

No change required once upstream jobs pass. Optionally add `test` to `needs` when test job is blocking.

---

### 8. Deploy — production environment protection

**Errors:**

```
Branch "master" is not allowed to deploy to Production due to environment protection rules.
The deployment was rejected or didn't satisfy other protection rules.
```

**GitHub settings (repo → Settings → Environments → production):**

1. **Deployment branches:** allow `master` (repo default branch) or "Selected branches" including `master`.
2. Confirm required reviewers / wait timers are intentional.
3. Ensure environment secrets/vars exist per feat-0001 (`COOLIFY_*`, `API_URL`, etc.).

**Workflow alignment:** `deploy.yml` maps `github.ref_name == 'master'` → `production` — environment name must match GitHub Environment slug `production`.

**Alternative:** If production should be manual-only, gate `build` / deploy jobs with `if: github.event_name == 'workflow_dispatch'` and document in PRODUCT.

---

### 9. Node.js 20 action deprecation (warnings)

Warnings on `actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4`.

**Phase 2 task:**

- Bump to latest minor/patch versions that declare Node 24 support, **or**
- Set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` at workflow `env` level after smoke test.

Not a blocker for feat-0002 acceptance.

---

## Implementation checklist

### P0 — unblock CI success

- [x] Remove `@typescript-eslint/indent` from `configs/eslint/next.js`
- [x] Remove `turborepo/cache-action@v1` from `ci.yml` and `deploy.yml`
- [x] Fix `apps/mobile/app.json` (`android.label`)
- [x] Run `expo install --check` in `apps/mobile` and commit lockfile
- [x] Fix TruffleHog `base`/`head` for `push` and `pull_request`

### P1 — quality gates

- [x] Narrow Express `req.params` in `studio.controller.ts` (and grep for other bare assignments)
- [x] Repair or remove 9 failing API test suites
- [x] Promote `pnpm typecheck:api` to required (remove `continue-on-error`)
- [x] Promote `pnpm test:ci` to required (remove `continue-on-error` on test job)

### P2 — CD and hygiene

- [ ] GitHub `production` environment allows `master` deploys
- [ ] Node 24 / action version bump
- [ ] Migrate `@troott/website` from `next lint` to `eslint .`

---

## Verification script (local CI parity)

```bash
pnpm install --frozen-lockfile

pnpm lint
pnpm typecheck:workspace
pnpm typecheck:api
pnpm build:ci
(cd apps/mobile && pnpm dlx expo-doctor@latest)
pnpm test:ci
```

All commands should exit 0 before merging remediation PR.

---

## Files touched (expected)

| Path | Change |
| ---- | ------ |
| `configs/eslint/next.js` | Remove deprecated indent rule |
| `.github/workflows/ci.yml` | Cache action, TruffleHog, optional test/typecheck strictness |
| `.github/workflows/deploy.yml` | Remove cache action |
| `apps/mobile/app.json` | Remove invalid `android.label` |
| `apps/mobile/package.json` / `pnpm-lock.yaml` | Expo patch alignment |
| `apps/api/src/controllers/core/studio.controller.ts` | Param narrowing |
| `apps/api/test/unit/**` | Suite repairs |
| GitHub → Environments → production | Branch deployment rules |

---

## Changelog

| Date | Note |
| ---- | ---- |
| 2026-06-03 | Initial spec from `master` CI/CD annotation triage |
