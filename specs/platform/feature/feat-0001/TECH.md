# feat-0001: Tech — CI/CD (Pacepard reference)

## Context

See [PRODUCT.md](./PRODUCT.md). Implement GitHub Actions + Coolify + EAS for the Troott monorepo, using Pacepard as the **reference repo**:

```
/Users/pro/Documents/ProjectPacepard/pacepard
├── .github/workflows/ci.yml      ← validate, test, build, security
└── .github/workflows/deploy.yml  ← Coolify deploy api, web, app, service
```

Troott today:

```
troott/
├── .github/workflows/verify-monorepo-expo.yml   ← install + expo-doctor only
├── package.json          pnpm@10.33.0, turbo scripts
├── turbo.json
├── apps/api/             @troott/api   — build → dist/, start node dist/server.js
├── apps/web/             @troott/web   — build → dist/ (Vite studio portal)
├── apps/website/         @troott/website — build → .next/ (Next.js marketing, troott.com)
├── apps/mobile/          @troott/mobile — Expo 54, eas.json
```

---

## Pacepard → Troott mapping

| Pacepard | Troott | Deploy target |
| -------- | ------ | ------------- |
| `@pacepard/api` | `@troott/api` | Coolify `COOLIFY_APP_UUID_API` → **`api.troott.com`** |
| `@pacepard/web` | `@troott/web` | Coolify `COOLIFY_APP_UUID_WEB` → **`app.troott.com`** |
| `@pacepard/demo` | `@troott/website` | Coolify `COOLIFY_APP_UUID_WEBSITE` (marketing) |
| `@pacepard/app` | `@troott/mobile` | **EAS** (not Coolify) |
| `@pacepard/service` | *(none phase 1)* | Workers in API process |

---

## Toolchain pins (Troott — do not copy Pacepard verbatim)

| Tool | Pacepard | Troott (normative) |
| ---- | -------- | ------------------ |
| pnpm | 9.0.0 | **10.33.0** (`package.json` `packageManager`) |
| Node | 20 | **22** (match existing `verify-monorepo-expo.yml`) |
| Monorepo runner | turbo | turbo |
| Mobile | — | Expo SDK 54, `expo-doctor` in CI |

---

## CI workflow — target structure

**File:** `.github/workflows/ci.yml` (new; replace standalone Expo verify)

Derived from Pacepard `ci.yml` with Troott commands:

```yaml
name: CI

on:
  push:
    branches: [development, staging, main, favour-development, damola-development]
  pull_request:

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '10.33.0'
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  validate:    # lint + typecheck + format (warn)
  test:        # pnpm test
  build:       # pnpm build + artifact upload
  mobile:      # expo-doctor (from verify-monorepo-expo.yml)
  security:    # pnpm audit + trufflehog (warn phase 1)
  ci-success:  # needs validate, build, mobile
```

### Validate job commands

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck:workspace
pnpm format:check || true   # phase 1: continue-on-error like Pacepard
```

### Test job

```bash
pnpm test
# API: jest --ci via apps/api package.json test:ci when wired in turbo
# Web: vitest run via apps/web
```

### Build job

```bash
pnpm build
# Artifacts (Pacepard pattern + Troott website):
#   apps/api/dist
#   apps/web/dist
#   apps/website/.next
#   packages/*/dist   (if any)
```

Or filtered builds for CD:

```bash
pnpm build:api
pnpm build:web
pnpm build:website   # turbo → @troott/website next build
```

### Mobile job (preserve current behavior)

```bash
pnpm install --frozen-lockfile
pnpm dlx expo-doctor@latest
# working-directory: apps/mobile
```

### Paths ignore (optional, match Pacepard)

Skip CI on docs-only pushes:

```yaml
paths-ignore:
  - '**.md'
  - 'docs/**'
  - 'specs/**'
```

---

## CD workflow — target structure

**File:** `.github/workflows/deploy.yml` (new)

Copy structure from Pacepard `deploy.yml`:

1. **`determine-environment`** — `workflow_dispatch` input or branch name → `development` | `staging` | `production`
2. **`build`** — `pnpm install --frozen-lockfile`, `pnpm build`, upload artifact
3. **`deploy-api`** — download artifact, Coolify GET deploy for `COOLIFY_APP_UUID_API`
4. **`deploy-web`** — same for `COOLIFY_APP_UUID_WEB` (studio portal)
5. **`deploy-website`** — same for `COOLIFY_APP_UUID_WEBSITE` (Next.js marketing)
6. Skip **`deploy-app`** Coolify step for Troott — use EAS workflow instead

`workflow_dispatch` **apps** input (extend Pacepard): `api,web,website,mobile` — default `api,web,website`.

### Branch → environment (Troott)

| Trigger | `needs.determine-environment.outputs.env` |
| ------- | ------------------------------------------- |
| `workflow_dispatch` input | user choice |
| `main` | `production` |
| `staging` | `staging` |
| `development` / `*-development` | `development` |

### Coolify deploy step (unchanged from Pacepard)

```bash
curl -s -w "\n%{http_code}" -X GET \
  "$COOLIFY_API_URL/api/v1/deploy?uuid=$COOLIFY_APP_UUID&force=false" \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN"
```

Each deploy job uses GitHub **`environment:`** so production requires reviewers:

```yaml
environment:
  name: ${{ needs.determine-environment.outputs.env }}
  url: ${{ vars.API_URL }}   # or WEB_URL / WEBSITE_URL per job
```

---

## GitHub configuration

### Repository secrets (per Pacepard naming)

| Secret | Used by |
| ------ | ------- |
| `COOLIFY_API_TOKEN` | deploy-api, deploy-web, deploy-website |
| `COOLIFY_APP_UUID_API` | deploy-api |
| `COOLIFY_APP_UUID_WEB` | deploy-web (studio portal) |
| `COOLIFY_APP_UUID_WEBSITE` | deploy-website (marketing) |
| `TURBO_TOKEN` | CI build cache (optional) |
| `EXPO_TOKEN` | EAS workflow (mobile) |

### Repository / environment variables

| Variable | Example |
| -------- | ------- |
| `COOLIFY_API_URL` | `https://coolify.example.com` |
| `API_URL` | `https://api.troott.com` |
| `WEB_URL` | `https://app.troott.com` |
| `WEBSITE_URL` | `https://troott.com` |
| `TURBO_TEAM` | pacepard org slug |

Configure **GitHub Environments** `development`, `staging`, `production` with environment-scoped UUIDs if they differ per env.

---

## Mobile CD — EAS (separate workflow)

**File:** `.github/workflows/mobile-eas.yml` (new, phase 1)

Not in Pacepard deploy.yml (Pacepard used Coolify for `app`). Troott mobile is Expo:

| Profile | `eas.json` | When to run |
| ------- | ---------- | ----------- |
| `preview` | internal APK | manual dispatch on `staging` |
| `production` | store build | tag `mobile/v*` or manual on `main` |

```bash
pnpm install --frozen-lockfile
pnpm --filter @troott/mobile exec eas build --platform all --profile production --non-interactive
```

Requires `EXPO_TOKEN` secret and EAS project linked in `apps/mobile/app.json`.

---

## API runtime deploy notes

Coolify builds/pulls the repo and runs `@troott/api` start command. Production URL: **`https://api.troott.com`**.

Align with:

- [`media-compute-deployment-plan.md`](../../../api/media-compute-deployment-plan.md) — ffmpeg, Redis, Mongo, three S3 buckets
- [`example.env`](../../../../apps/api/example.env) — env vars must be set in Coolify, not committed

Worker processes start inside the same container today (`startWorkers()` in `server.ts`). No separate `deploy-service` job until worker split.

---

## Web runtime deploy notes (studio portal)

- Package: `@troott/web`
- Production URL: **`https://app.troott.com`**
- Build output: `apps/web/dist` (Vite)
- Serve via static file server or Coolify nginx template
- Env: `VITE_APP_API_URL` injected at **build time** in CI/CD (`deploy.yml` uses `vars.API_URL`); studio dev server runs on port **5053**

---

## Website runtime deploy notes (marketing)

- Package: `@troott/website`
- Stack: **Next.js 15** (App Router, Turbopack dev)
- Build: `pnpm build:website` → `next build` → `apps/website/.next`
- Start: `next start` (Node server) — Coolify runs as Node app, not static export
- Public URL: `https://troott.com` ([`siteConfig.url`](../../../../apps/website/app/siteConfig.tsx))
- Lint: `next lint` via `pnpm --filter @troott/website lint` (included in root `pnpm lint` turbo graph)
- Env: `NEXT_PUBLIC_APP_API_URL` at build time; dev on port **3051**, Docker/`next start` on **3000**
- Server routes under `app/api/` (e.g. subscribe) need runtime env (`MAILERLITE_*`) in Coolify
- Pacepard analogue: `@pacepard/demo` (`pnpm build:demo`)

**Do not** deploy `@troott/website` to the same Coolify app as `@troott/web` — different build output, domains, and env.

---

## Migration from current state

| Step | Action |
| ---- | ------ |
| 1 | Add `.github/workflows/ci.yml` per above |
| 2 | Add `.github/workflows/deploy.yml` (api, web, website) |
| 3 | Add `.github/workflows/mobile-eas.yml` |
| 4 | **Delete** `.github/workflows/verify-monorepo-expo.yml` after mobile job lives in CI | Done — merged into `ci.yml` `mobile` job |
| 5 | Configure GitHub secrets/vars/environments |
| 6 | Wire Coolify apps to Troott repo branches |
| 7 | First dry-run: PR → CI green; push `staging` → deploy staging |

---

## Implementation checklist

| # | Task | Owner |
| - | ---- | ----- |
| 1 | Create `ci.yml` from Pacepard template + Troott pins | Platform |
| 2 | Create `deploy.yml` (api, web, website) | Platform |
| 3 | Create `mobile-eas.yml` | Mobile |
| 4 | Remove legacy `verify-monorepo-expo.yml` | Platform |
| 5 | Add `test:ci` to turbo `test` pipeline for `@troott/api` if not failing CI today | API |
| 6 | Document Coolify UUIDs in team password vault | Ops |
| 7 | Enable branch protection: require CI success | Ops |

---

## Verification

```bash
# Local parity with CI validate job
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck:workspace
pnpm test
pnpm build
pnpm build:website   # optional isolated check

# Mobile
pnpm dlx expo-doctor@latest
# cwd: apps/mobile
```

---

## Related code and docs

| Path | Role |
| ---- | ---- |
| `/Users/pro/Documents/ProjectPacepard/pacepard/.github/workflows/ci.yml` | Reference CI |
| `/Users/pro/Documents/ProjectPacepard/pacepard/.github/workflows/deploy.yml` | Reference CD |
| `troott/.github/workflows/ci.yml` | CI — validate, test, build, expo-doctor |
| `troott/.github/workflows/deploy.yml` | CD — Coolify api + web + website |
| `troott/.github/workflows/mobile-eas.yml` | EAS builds |
| `troott/.github/README.md` | Secrets / vars setup |
| `troott/package.json` | Root scripts |
| `troott/turbo.json` | Task graph |
| `troott/docs/CI_GUARDRAILS.md` | Extra lint bans |
| `troott/apps/mobile/eas.json` | EAS profiles |
| `troott/apps/website/package.json` | Next.js scripts |
| `troott/apps/website/app/siteConfig.tsx` | Canonical public URL |
