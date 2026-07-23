# GitHub Actions — feat-0001 CI/CD

Configure these in the GitHub repo before the first deploy.

## Environments

Create GitHub Environment: **`staging`** (primary / Alpha). Optionally create **`production`** for manual production deploys later.

- **staging** — push to `master` or `staging`; env-scoped variables/secrets for Coolify Alpha.
- **production** — manual `workflow_dispatch` only (not auto-deployed from `master` yet).
- **development** — branch `development`; repository-level secrets/vars (no GitHub Environment required).

Set per-environment overrides (e.g. `API_URL`, Coolify UUIDs) on **staging** (and **production** when you add it).

## Environment variables (per GitHub Environment)

| Variable | Staging (primary) | Production (manual) |
| -------- | ----------------- | ------------------- |
| `COOLIFY_API_URL` | Coolify base URL | same instance or prod Coolify |
| `API_URL` | `https://api.staging.troott.com` | `https://api.troott.com` |
| `WEB_URL` | `https://app.staging.troott.com` | `https://app.troott.com` |
| `WEBSITE_URL` | `https://staging.troott.com` | `https://troott.com` |
| `TURBO_TEAM` | *(optional)* | *(optional)* |
| `GET_TROOTT_ENABLED` | `true` *(optional)* | `true` *(optional)* |
| `REQUEST_DEMO_URL` | Calendly or empty *(optional)* | same |

Repository-level defaults may still hold old production URLs; **staging Environment must override** the three URL vars above.

## Environment secrets (per GitHub Environment)

| Secret | Staging (primary) | Production (manual) |
| ------ | ----------------- | ------------------- |
| `COOLIFY_API_TOKEN` | Coolify API token | same or separate |
| `COOLIFY_APP_UUID_API` | staging API Coolify UUID | production API UUID |
| `COOLIFY_APP_UUID_WEB` | staging studio Coolify UUID | production studio UUID |
| `COOLIFY_APP_UUID_WEBSITE` | staging website Coolify UUID | production website UUID |
| `TURBO_TOKEN` | *(optional)* | *(optional)* |
| `EXPO_TOKEN` | `mobile-eas.yml` | same |

Do **not** reuse production Coolify UUIDs on the staging Environment.

Build jobs inject:

- `VITE_APP_API_URL` / `VITE_TROOTT_WEB_APP_URL` from `API_URL` / `WEB_URL`
- `NEXT_PUBLIC_APP_API_URL` / `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_WEB_APP_URL` from `API_URL` / `WEBSITE_URL` / `WEB_URL`
- `NEXT_PUBLIC_APP_ENVIRONMENT` = GitHub env name (`staging` | `production` | `development`)

GHCR tags: `ghcr.io/thetroott/troott-{api,web,website}:staging` (and `:production` for manual, `:development`).

## Workflows

| File | Trigger | Purpose |
| ---- | ------- | ------- |
| `ci.yml` | PR + push to `development` / `staging` / `master` | Lint, typecheck, build, expo-doctor |
| `deploy.yml` | Push to `development` / `staging` / `master`; manual **staging** (default) or **production** | Build/push GHCR images + Coolify deploy |
| `mobile-eas.yml` | Manual | EAS build for `@troott/mobile` |

**Branch → deploy env:** `master` and `staging` → **staging**; `development` → **development**. Production is **manual dispatch only**.

**Deploy flow:** GitHub Actions runs `docker buildx` and pushes `ghcr.io/<lowercase-org>/troott-{api,web,website}:<env>`. Coolify apps use **Docker Compose** under `deploy/coolify/` and pull those images (`GHCR_ORG`, `IMAGE_TAG=staging`). See [docs/coolify-monorepo-setup.md](../../docs/coolify-monorepo-setup.md).

Repository **Settings → Actions → Workflow permissions** must allow **Read and write** (packages publish).

Spec: [`specs/platform/feature/feat-0001/PRODUCT.md`](../../specs/platform/feature/feat-0001/PRODUCT.md)
