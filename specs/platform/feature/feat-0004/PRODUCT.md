# feat-0004: Docker pnpm patches and CI test bootstrap — GHCR deploy follow-up

## Summary

After feat-0001 GHCR deploy landed (`docs(ci): update GitHub Actions setup for GHCR deploy`), **Deploy** and **CI** still fail for unrelated reasons:

1. **All three Docker build jobs** fail at `pnpm install` because root **`patchedDependencies`** reference files under `patches/` that are not copied into the image context.
2. **CI Test** fails because `sermon.router-order.test.ts` imports the real sermon router → auth middleware → `TokenService`, which throws when **`JWT_EXPIRY`** is unset in Jest (only `JWT_SECRET` is seeded today).

This spec is a **follow-up to [feat-0001](../feat-0001/PRODUCT.md)** (GHCR + Coolify compose). **Out of scope:** Coolify UI changes, new app features, `pnpm audit` remediation.

---

## Problem (observed on Deploy #5 / CI #6)

| Workflow | Job | Symptom |
| -------- | --- | ------- |
| **Deploy** | Build and push (troott-api) | `ENOENT … /app/patches/react-native-css-interop@0.2.2.patch` |
| **Deploy** | Build and push (troott-web) | `ENOENT … /app/patches/@rntp__player@5.0.0-beta.4.patch` |
| **Deploy** | Build and push (troott-website) | Same `@rntp__player` patch ENOENT |
| **CI** | Test | `JWT_EXPIRY is not defined` in `sermon.router-order.test.ts` |

---

## Root cause

1. **Monorepo patches at root** — `package.json` and `pnpm-workspace.yaml` declare `pnpm.patchedDependencies` for mobile-related packages. Even `--filter @troott/api` (or web/website) resolves the **full lockfile**, so pnpm reads patch files before install completes.
2. **Dockerfiles copy only** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and the target app’s `package.json` — **not** `patches/`.
3. **Router-order test** loads production module graph without mocking auth; `setup-jest.ts` sets `JWT_SECRET` but not `JWT_EXPIRY`, so `TokenService` constructor fails at import time.

---

## Goals

1. **Deploy** build-and-push jobs for api, web, and website complete and push to GHCR.
2. **CI** `pnpm test:ci` passes including `sermon.router-order.test.ts`.
3. Document a **local Docker smoke** command that matches CI (`docker build` from repo root).
4. Prevent regression: any new root-level patch file must be included in Docker deps stage (document in TECH).

---

## Acceptance criteria

### Deploy

- [ ] `docker build -f apps/api/Dockerfile .` succeeds locally from repo root.
- [ ] `docker build -f apps/web/Dockerfile .` succeeds (with optional build-args).
- [ ] `docker build -f apps/website/Dockerfile .` succeeds (with optional build-args).
- [ ] GitHub Actions **Build and push** jobs for troott-api, troott-web, troott-website pass on push to `master`.

### CI

- [ ] `pnpm --filter @troott/api test:ci` exits 0.
- [ ] **Test** and **CI success** jobs pass on push to `master`.

### Code

- [ ] All three app Dockerfiles `COPY patches/` (or equivalent) before `pnpm install` in the **deps** stage.
- [ ] `apps/api/test/setup-jest.ts` sets test defaults for `JWT_EXPIRY` (and documents parity with `example.env`).

---

## Risks and decisions

| Decision | Rationale |
| -------- | --------- |
| Copy entire `patches/` dir | Small (2 files); avoids drift when patches change; matches pnpm lockfile expectations. |
| Do not strip patchedDependencies for Docker | Patches are part of the canonical lockfile; removing them would require a separate lock or `pnpm install` flags that diverge from CI. |
| Fix JWT in global Jest setup | Router-order test intentionally imports real router; bootstrap env is the minimal fix vs mocking half the app. |

---

## References

- [feat-0001 TECH](../feat-0001/TECH.md) — GHCR deploy workflow
- [docs/coolify-monorepo-setup.md](../../../docs/coolify-monorepo-setup.md) — Coolify pull model
- Root patches: `patches/@rntp__player@5.0.0-beta.4.patch`, `patches/react-native-css-interop@0.2.2.patch`
