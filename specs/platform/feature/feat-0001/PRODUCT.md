# feat-0001: CI/CD for Troott apps (Pacepard reference)

## Summary

Troott is a **pnpm + Turborepo** monorepo with four deployable surfaces:

| App | Package | Role |
| --- | ------- | ---- |
| API | `@troott/api` | Express API, Bull workers, scheduler (monolith) |
| Web | `@troott/web` | Minister / creator / admin portal (Vite SPA) |
| Mobile | `@troott/mobile` | Listener app (Expo / React Native) |
| Website | `@troott/website` | Public marketing site (Next.js 15 — `troott.com`) |

Today Troott has **one** GitHub workflow (`verify-monorepo-expo.yml`) that only checks install + Expo doctor. Production delivery is manual or ad hoc.

This spec defines **CI/CD parity with Pacepard**: GitHub Actions for quality gates and builds, **Coolify** for server-side apps (API, studio web, marketing website), **EAS** for mobile store builds — using the Pacepard monorepo as the **reference implementation**.

**Reference repo (local):** `/Users/pro/Documents/ProjectPacepard/pacepard`

| Pacepard artifact | Troott equivalent |
| ----------------- | ----------------- |
| `.github/workflows/ci.yml` | Troott CI workflow (new) |
| `.github/workflows/deploy.yml` | Troott CD workflow (new) |
| `apps/api` | `apps/api` |
| `apps/web` | `apps/web` (studio portal — Vite) |
| `apps/demo` | `apps/website` (marketing — Next.js) |
| `apps/app` | `apps/mobile` (Expo listener app) |
| `apps/service` | *Out of scope phase 1* — workers live inside `@troott/api` monolith |
| Coolify deploy per app UUID | Same pattern for API + web + website |

Related: [`media-compute-deployment-plan.md`](../../../api/media-compute-deployment-plan.md) (AWS buckets, ffmpeg, EC2 sizing — **runtime infra**, not GitHub Actions).

---

## Problem

| Gap | Impact |
| --- | ------ |
| No lint / typecheck / test gate on PR | Regressions merge silently |
| No `pnpm build` in CI | Broken builds discovered at deploy time |
| No environment-scoped deploy workflow | Manual Coolify clicks; drift between dev/staging/prod |
| Mobile not tied to CI | Expo health only; no EAS build promotion |
| No `@troott/website` in CI build | Marketing site breaks silently while studio web passes |
| Troott pins differ from Pacepard (pnpm 10, Node 22) | Blind copy of Pacepard YAML would fail |

---

## Goals

1. **Every PR and protected-branch push** runs CI: install (frozen lockfile), lint, workspace typecheck, tests, build.
2. **Protected branches** trigger CD to the matching environment via Coolify (API + studio web + marketing website).
3. **Mobile** uses EAS Build/Submit on tagged releases or manual workflow — not Coolify.
4. **One mapping table** from Pacepard secrets/vars → Troott Coolify applications.
5. **No legacy dual pipelines** — replace the minimal Expo-only workflow with the full CI job graph; keep Expo doctor as a mobile-specific job inside CI.

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-CI01 | Engineer opening a PR | CI to fail on lint/type errors | I fix before review |
| UC-CI02 | Release owner | Push to `staging` to deploy API, studio web, and website | Stakeholders test one environment |
| UC-CI03 | Mobile lead | EAS production build from a tagged release | Store submission is repeatable |
| UC-CI04 | Platform engineer | Pacepard deploy.yml as template | Troott secrets/vars follow the same names |
| UC-CI06 | Marketing | Website deploy on same branch as API | `troott.com` stays in sync with releases |

---

## Troott apps (do not conflate)

| Package | Path | Stack | Typical URL | Audience |
| ------- | ---- | ----- | ----------- | -------- |
| `@troott/website` | `apps/website` | Next.js 15 (App Router) | `https://troott.com` | Public — landing, FAQs, waitlist |
| `@troott/web` | `apps/web` | Vite SPA | `https://app.troott.com` | Ministers, creators, admins (studio portal) |
| `@troott/api` | `apps/api` | Express + Bull | `https://api.troott.com` | All clients |
| `@troott/mobile` | `apps/mobile` | Expo / RN | App stores (deep links → `app.troott.com`) | Listeners |

Studio portal (`@troott/web`) and marketing site (`@troott/website`) are **separate Coolify applications** with separate UUIDs.

### Production domains (normative)

| Host | App | GitHub var |
| ---- | --- | ---------- |
| `https://api.troott.com` | `@troott/api` | `API_URL` |
| `https://app.troott.com` | `@troott/web` (studio portal) | `WEB_URL` |
| `https://troott.com` | `@troott/website` (marketing) | `WEBSITE_URL` |

Do not use `studio.troott.com` in new deploy config — **`app.troott.com`** is the studio portal hostname (aligned with mobile share / deep-link base in [feat-0014](../../mobile/feature/feat-0014/PRODUCT.md)).

---

## Environments and branches

Align with Pacepard **branch → environment** convention (adapt branch names to Troott remotes):

| Git branch | Environment | Deploy API | Deploy studio web | Deploy website |
| ---------- | ----------- | ---------- | ----------------- | -------------- |
| `development` (or team `*-development`) | development | yes | yes | yes |
| `staging` | staging | yes | yes | yes |
| `main` / `master` | production | yes | yes | yes |

**Normative for Troott:**

- Long-lived integration branches (`favour-development`, `damola-development`, etc.) run **CI only** unless explicitly mapped to Coolify `development`.
- **`staging` and `main`** are the only branches that auto-deploy to staging/production without `workflow_dispatch`.

---

## CI scope (what must pass)

| Stage | Command (repo root) | Required |
| ----- | ------------------- | -------- |
| Install | `pnpm install --frozen-lockfile` | yes |
| Lint | `pnpm lint` | yes |
| Typecheck | `pnpm typecheck:workspace` | yes |
| Test | `pnpm test` | yes (fail when app tests fail; API `test:ci` included via turbo) |
| Build | `pnpm build` (includes `@troott/website` via turbo) | yes |
| Format | `pnpm format:check` | warn-only phase 1 (match Pacepard) |
| Security | `pnpm audit --prod` | warn-only phase 1 |
| Mobile health | `pnpm dlx expo-doctor@latest` in `apps/mobile` | yes |

See [`docs/CI_GUARDRAILS.md`](../../../../docs/CI_GUARDRAILS.md) for Troott-specific ban patterns (future lint rules).

---

## CD scope (what deploys where)

| Target | Mechanism | Phase |
| ------ | --------- | ----- |
| `@troott/api` | Coolify API trigger (`COOLIFY_APP_UUID_API`) | 1 |
| `@troott/web` | Coolify API trigger (`COOLIFY_APP_UUID_WEB`) — studio portal | 1 |
| `@troott/website` | Coolify API trigger (`COOLIFY_APP_UUID_WEBSITE`) — Next.js marketing | 1 |
| `@troott/mobile` | EAS Build (`eas.json` profiles) | 1 (manual/tag) |
| Dedicated media worker service | AWS EC2 / separate Coolify app | 2 — see media compute plan |

Coolify deploy is **trigger-only** (Pacepard pattern): GitHub Actions does not SSH; it calls `GET /api/v1/deploy?uuid=…` with `COOLIFY_API_TOKEN`.

---

## Acceptance criteria

1. `.github/workflows/ci.yml` exists and mirrors Pacepard job structure (validate → test → build → ci-success).
2. `.github/workflows/deploy.yml` exists and deploys API, studio web, and website per environment with Pacepard-compatible secrets.
3. Existing `verify-monorepo-expo.yml` is **merged into CI** (mobile job) or removed — not a parallel legacy path.
4. `pnpm install --frozen-lockfile` uses **pnpm 10** and **Node 22** (Troott `packageManager` pin).
5. Turbo remote cache optional via `TURBO_TOKEN` / `TURBO_TEAM` (same as Pacepard).
6. GitHub Environment names: `development`, `staging`, `production` with URL vars (`API_URL`, `WEB_URL`, `WEBSITE_URL`).
7. Documented mapping from Pacepard Coolify UUIDs to Troott applications (api, web, **website**) in [TECH.md](./TECH.md).
8. Mobile EAS: `workflow_dispatch` or tag `mobile/v*` triggers `eas build` — documented, not Coolify.
9. `pnpm build:website` / turbo `@troott/website` **`next build`** succeeds in CI; artifact path includes `apps/website/.next`.

---

## Out of scope

- Replacing Coolify with Vercel/AWS CodePipeline (future evaluation).
- Splitting API and Bull workers into separate deploy units (phase 2 — [`media-compute-deployment-plan.md`](../../../api/media-compute-deployment-plan.md)).
- OpenAPI codegen CI drift ([`docs/codegen-followup.md`](../../../../docs/codegen-followup.md)) — separate ticket.
- Playwright e2e for web (Pacepard agency uses Nx e2e; Troott has none yet).

---

## No fallback, no legacy (hard requirement)

| Do not | Why |
| ------ | --- |
| Keep `verify-monorepo-expo.yml` as the **only** CI gate after feat-0001 ships | Incomplete quality bar |
| Deploy from developer laptops to staging/production | CD goes through GitHub Environments + Coolify |
| Copy Pacepard pnpm 9 / Node 20 pins without updating Troott lockfile | CI must match `package.json` `packageManager` |
| Coolify deploy without `environment:` gate on production | Prevents accidental prod deploy from wrong branch |
| Feature flag to skip `pnpm build` in CI | Build is required for cd artifact path |

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Workflow YAML outline, secrets, file paths |
| [Pacepard CI](file:///Users/pro/Documents/ProjectPacepard/pacepard/.github/workflows/ci.yml) | Reference CI |
| [Pacepard Deploy](file:///Users/pro/Documents/ProjectPacepard/pacepard/.github/workflows/deploy.yml) | Reference CD |
| [`specs/platform/README.md`](../../README.md) | Platform spec index |
