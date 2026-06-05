# GitHub Actions — feat-0001 CI/CD

Configure these in the GitHub repo before the first deploy.

## Environments

Create GitHub Environments: **`staging`** and **`production`**.

- **staging** — branch `staging`; env-scoped variables/secrets for staging deploys and CI on that branch.
- **production** — branch `master`; optional required reviewers before deploy jobs run.

The **`development`** branch still deploys (GHCR tag `development`) and runs CI using **repository-level** secrets and variables — no GitHub Environment required.

Set per-environment overrides (e.g. `API_URL`, Coolify UUIDs) on **staging** and **production** when values differ from repository defaults.

## Repository variables

| Variable | Example |
| -------- | ------- |
| `COOLIFY_API_URL` | `https://coolify.example.com` |
| `API_URL` | `https://api.troott.com` |
| `WEB_URL` | `https://app.troott.com` |
| `WEBSITE_URL` | `https://troott.com` |
| `TURBO_TEAM` | *(optional)* Turbo remote cache team |

Per-environment overrides apply when jobs attach `environment: staging` or `environment: production`.

## Repository secrets

| Secret | Used by |
| ------ | ------- |
| `COOLIFY_API_TOKEN` | `deploy.yml` |
| `COOLIFY_APP_UUID_API` | API → api.troott.com |
| `COOLIFY_APP_UUID_WEB` | Studio portal → app.troott.com |
| `COOLIFY_APP_UUID_WEBSITE` | Marketing → troott.com |
| `TURBO_TOKEN` | CI/CD build cache *(optional)* |
| `EXPO_TOKEN` | `mobile-eas.yml` |

Build job injects `VITE_APP_API_URL` and `NEXT_PUBLIC_APP_API_URL` from the `API_URL` variable when building Docker images in `deploy.yml`.

## Workflows

| File | Trigger | Purpose |
| ---- | ------- | ------- |
| `ci.yml` | PR + push to `development` / `staging` / `master` | Lint, typecheck, build, expo-doctor |
| `deploy.yml` | Push to `development` / `staging` / `master`; manual **staging** or **production** | Build/push GHCR images + Coolify deploy |
| `mobile-eas.yml` | Manual | EAS build for `@troott/mobile` |

**Deploy flow:** GitHub Actions runs `docker buildx` and pushes `ghcr.io/<lowercase-org>/troott-{api,web,website}:<env>`. Coolify apps use **Docker Compose** compose files under `deploy/coolify/` and pull those images (`GHCR_ORG`, `IMAGE_TAG` env vars). See [docs/coolify-monorepo-setup.md](../../docs/coolify-monorepo-setup.md).

Repository **Settings → Actions → Workflow permissions** must allow **Read and write** (packages publish).

Spec: [`specs/platform/feature/feat-0001/PRODUCT.md`](../../specs/platform/feature/feat-0001/PRODUCT.md)
