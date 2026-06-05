# feat-0002: CI/CD pipeline remediation

## Summary

[feat-0001](../feat-0001/PRODUCT.md) introduced GitHub Actions CI (`ci.yml`) and CD (`deploy.yml`) for the Troott monorepo. The first runs on protected branches and PRs are **failing across multiple jobs**, and production deploy from `master` is **blocked by GitHub environment protection**.

This spec defines what must be fixed so that:

1. **CI** is green on a normal push to `master` / PR (validate, build, expo-doctor, ci-success).
2. **CD** can deploy `master` → production when operators intend it (subject to environment reviewers).
3. **Warnings** (Node 20 action deprecation) are tracked without blocking the initial fix.

**Scope:** Workflow YAML, shared ESLint config, mobile Expo config/deps, API unit tests, GitHub repository/environment settings. **Out of scope:** Application feature work unrelated to pipeline health; EAS mobile store release automation (still manual per feat-0001).

---

## Problem

A push to `master` produced **16 errors and 4 warnings** across CI/CD. Required jobs failed; optional jobs surfaced additional debt.

| Job / area | Symptom | User impact |
| ---------- | ------- | ----------- |
| **Validate** | `@troott/website#lint` exit 1 | Marketing site lint blocks or annotates CI |
| **Validate** | TypeScript `string \| string[]` not assignable to `string` (5 annotations) | Type safety debt in API route handlers (visible when API typecheck is enforced) |
| **Build** | `turborepo/cache-action@v1` — repository not found | No build artifacts; downstream CD cannot run |
| **Expo doctor** | `app.json` schema + 7 patch version mismatches | Mobile health gate fails |
| **Test** | 9 / 11 API Jest suites fail | Regression signal is broken |
| **Security** | TruffleHog: BASE and HEAD same; `pnpm audit` 152 vulns | Security job exits 1 (even when steps are warn-only, annotations confuse triage) |
| **CI success** | Aggregator fails when validate / build / mobile fail | Merge appears blocked |
| **Deploy** | `master` not allowed to deploy to Production | Production CD rejected by environment rules |
| **Warnings** | Node.js 20 actions deprecated on `checkout`, `setup-node`, `pnpm/action-setup` | Future runner breakage (June–Sept 2026) |

---

## Goals

1. **Reproduce locally** — Every blocking CI command fails the same way on a clean `pnpm install` at repo root (documented in TECH).
2. **Fix blockers** — validate (lint + typecheck), build, expo-doctor, and ci-success pass without weakening gates permanently.
3. **Stabilize tests** — `pnpm test:ci` passes (API + web); remove or repair stale tests that reference deleted modules.
4. **Unblock CD** — Align GitHub `production` environment deployment branch rules with `master` (or document explicit `workflow_dispatch`-only production).
5. **Harden security job** — TruffleHog runs meaningfully on push and PR; audit policy is explicit (warn vs fail).
6. **Document Node 24 migration** — Plan action version bumps without mixing into blocker PR.

---

## Non-goals

- Resolving all 152 `pnpm audit` transitive vulnerabilities in one pass (firebase-admin / google-gax chain).
- Replacing `next lint` with ESLint CLI (recommended follow-up, not required for green CI).
- Changing Coolify application UUIDs or runtime secrets.

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-CI-FIX01 | Engineer merging to `master` | CI to pass on a code-only push | I trust the pipeline |
| UC-CI-FIX02 | Platform engineer | Build job to complete without invalid actions | Artifacts upload for CD |
| UC-CI-FIX03 | Mobile engineer | `expo-doctor` to pass in CI | SDK drift is caught early |
| UC-CI-FIX04 | API engineer | `pnpm test:ci` green | Refactors do not break unnoticed |
| UC-CI-FIX05 | Release owner | Push `master` → production deploy (with reviewers) | Releases are not manual-only |
| UC-CI-FIX06 | Security reviewer | Secret scan on every push/PR | TruffleHog does not no-op |

---

## Acceptance criteria

### CI (`ci.yml`)

- [x] `pnpm lint` exits 0 (all three packages: `@troott/api`, `@troott/web`, `@troott/website`).
- [x] `pnpm typecheck:workspace` exits 0.
- [x] `pnpm typecheck:api` exits 0 (promoted to **required** once fixed; remove `continue-on-error`).
- [x] `pnpm build:ci` exits 0 without `turborepo/cache-action`.
- [x] `pnpm dlx expo-doctor@latest` in `apps/mobile` exits 0.
- [x] `pnpm test:ci` exits 0.
- [x] **CI success** job passes when validate, build, and mobile pass.
- [x] **Security** job: TruffleHog scans a non-empty git range on push to `master`; job result policy documented (warn vs fail).
- [x] No regression: `paths-ignore` for `specs/**` still skips CI on docs-only pushes.

### CD (`deploy.yml`)

- [ ] Push to `master` triggers production build job without environment rejection **or** documented alternative (e.g. only `workflow_dispatch` to production).
- [ ] Build for deployment completes (same cache-action fix as CI).
- [ ] Coolify deploy jobs unchanged in contract (feat-0001).

### Local parity

- [ ] README or TECH lists copy-paste commands that match CI validate/build/mobile/test jobs.

---

## Risks and decisions

| Decision | Options | Recommendation |
| -------- | ------- | -------------- |
| Turborepo cache in GHA | Remove step vs `actions/cache` vs remote-only (`TURBO_TOKEN`) | **Remove invalid action**; rely on `TURBO_TOKEN` / `TURBO_TEAM` already in workflow env |
| `@typescript-eslint/indent` | Re-enable rule vs drop in favor of Prettier | **Remove deprecated rule** from `configs/eslint/next.js`; keep `indent` + Prettier |
| `android.label` in `app.json` | Remove vs move to `expo.android` correct field | **Remove** invalid key; use `expo.name` / adaptive icon (Expo SDK 54 schema) |
| API tests with jest mock errors | Fix jest/ts-node config vs delete obsolete tests | **Delete or rewrite** tests referencing removed paths (`sermon.router` module layout) |
| Production deploy from `master` | Add branch to environment vs rename branch to `main` | **Add `master`** to production environment deployment branches (repo uses `master`) |
| Security audit | `continue-on-error` vs `--audit-level=high` | Keep **warn-only** phase 1; fail only on configured severity threshold |

---

## Related

- [feat-0001 CI/CD](../feat-0001/PRODUCT.md) — baseline pipeline
- [TECH.md](./TECH.md) — file-level remediation checklist
- [`docs/CI_GUARDRAILS.md`](../../../../docs/CI_GUARDRAILS.md) — future lint bans
