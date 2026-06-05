# feat-0003: API route params and Turbo env — CI/CD follow-up

## Summary

Push `a91226d` to `master` (feat-0002 remediation) **still fails** CI and Deploy. The prior spec closed most gaps, but **three TypeScript errors** remain in the API build, and **undeclared Turbo environment variables** produce validate noise. The Security job also exits non-zero.

This spec is a **follow-up to [feat-0002](../feat-0002/PRODUCT.md)**. It targets the failures observed on the 2026-06-03 GitHub Actions run triggered by `@damolaoladipodamolaoladipo`.

**Scope:** API Express param typing, `turbo.json` env declarations, Security job exit policy, local/CI parity. **Out of scope:** New product features; full `pnpm audit` remediation.

---

## Problem (observed on `master` @ `a91226d`)

| Workflow | Job | Symptom | Duration |
| -------- | --- | ------- | -------- |
| **CI** | Validate | exit 1 — 3× `string \| string[]` not assignable to `string` | part of ~1m 47s |
| **CI** | Security | exit 1 | parallel |
| **CI** | CI success | exit 1 (downstream) | — |
| **Deploy** | Build for deployment | exit 2 — `@troott/api#build` `tsc` failed; same 3× TS errors | ~1m 47s |

### Validate annotations (non-blocking warnings)

| Source | Message |
| ------ | ------- |
| `apps/api/jest.config.ts` | `NODE_ENV`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET`, `CLOUDFRONT_STORAGE_URL` not in `turbo.json` |
| `apps/api/src/configs/aws.config.ts` | `NODE_ENV`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` not in `turbo.json` |
| GitHub Actions | Node.js 20 deprecation on `checkout@v4`, `setup-node@v4`, `pnpm/action-setup@v4` |

Turbo env messages are **`turbo/no-undeclared-env-vars`** (warn today via `eslint-plugin-only-warn`). They must still be fixed so strict Turbo cache mode and future lint policy do not regress.

---

## Root cause (concise)

1. **Incomplete Express param fix (feat-0002 P1)** — `studio.controller.ts` invite handlers still destructure `req.params` and pass `studioId` / `inviteId` as `string \| string[]` into service methods that require `string`. Three handlers ⇒ three CI-reported errors.
2. **No shared param helper** — Controllers use ad hoc narrowing; easy to miss routes when typecheck is enforced on CI/Linux clean installs.
3. **Turbo `globalEnv` gap** — API bootstrap files read `process.env.*` at module load; Turbo 2.8+ expects explicit declaration for cache correctness.
4. **Security job** — `pnpm audit --prod` exits non-zero (152 advisories); job-level success depends on `continue-on-error` and step ordering (see TECH).
5. **Local/CI drift** — `pnpm typecheck:api` may pass locally while CI `pnpm build:ci` → `@troott/api` `tsc --noEmit false` fails until all param sites are fixed; parity script must run both.

---

## Goals

1. **Zero** `string \| string[]` → `string` errors in `@troott/api` `tsc` (validate + build + deploy).
2. Declare API-related env vars in `turbo.json` (`globalEnv` and/or per-task `env`).
3. **CI** and **Deploy** build jobs green on push to `master`.
4. **Security** job documents warn-only policy and exits 0 when only audit/TruffleHog findings are non-blocking.
5. Add a **repo-wide route-param audit** so new controllers cannot regress.

---

## Acceptance criteria

### CI

- [x] `pnpm typecheck:api` exits 0 on clean `pnpm install --frozen-lockfile`.
- [x] `pnpm --filter @troott/api build` exits 0 (same `tsc` as Deploy).
- [x] `pnpm build:ci` exits 0.
- [x] `pnpm lint` exits 0; no new `turbo/no-undeclared-env-vars` for API bootstrap env keys.
- [ ] **Validate**, **Build**, **CI success** jobs pass on push to `master` (verify on remote after push).

### Deploy

- [ ] **Build for deployment** completes; artifacts upload for `apps/api/dist` (verify on remote after push).

### Security

- [x] **Security** job exits 0 with documented policy (audit warn-only; TruffleHog warn-only or skipped safely on edge-case pushes).

### Code quality

- [x] Shared `resolveRouteParam()` (or equivalent) used at all `req.params` call sites that pass into `string`-typed APIs.
- [x] Grep checklist in TECH completed; no bare `const { id } = req.params` without narrowing before service calls.

---

## Risks and decisions

| Decision | Recommendation |
| -------- | -------------- |
| Param normalization | Add `resolveRouteParam` in `helpers.util.ts`; use in controllers (not one-off destructuring) |
| Turbo env placement | `globalEnv` for `NODE_ENV`; `tasks.build.env` + `tasks.test.env` for AWS/CDN vars used at compile/test bootstrap |
| Security audit | Keep warn-only; optionally `--audit-level=high` later |
| Node 24 actions | Defer to feat-0002 P2; track warning only |

---

## Related

- [feat-0002](../feat-0002/PRODUCT.md) — initial CI remediation (partially complete)
- [feat-0001](../feat-0001/PRODUCT.md) — baseline CI/CD
- [TECH.md](./TECH.md) — file-level checklist and verification commands
