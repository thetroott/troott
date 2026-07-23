# Coolify — pre-built GHCR images

GitHub Actions builds and pushes images; Coolify **pulls** them (no build on the server).

| App | Compose file | GHCR image | Container port |
| --- | ------------ | ---------- | -------------- |
| API | `docker-compose.api.yaml` | `ghcr.io/<org>/troott-api:<env>` | 5025 |
| Studio web | `docker-compose.web.yaml` | `ghcr.io/<org>/troott-web:<env>` | 8080 |
| Marketing | `docker-compose.website.yaml` | `ghcr.io/<org>/troott-website:<env>` | 3000 |

`<env>` = `IMAGE_TAG`. **Primary / Alpha = `staging`.** Also: `development` | `production` (manual).

## Domains by environment

| App | Staging (primary / Alpha) | Production (later) |
| --- | ------------------------- | ------------------ |
| API | `https://api.staging.troott.com` | `https://api.troott.com` |
| Studio | `https://app.staging.troott.com` | `https://app.troott.com` |
| Marketing | `https://staging.troott.com` | `https://troott.com` (+ `www`) |

| Coolify env | Staging (required now) | Production (later) |
| ----------- | ---------------------- | ------------------ |
| `GHCR_ORG` | `thetroott` | `thetroott` |
| `IMAGE_TAG` | **`staging`** | `production` |

Create **separate** Coolify resources if you later add production (different UUIDs, domains, and `IMAGE_TAG`).

Setup: [docs/coolify-monorepo-setup.md](../../docs/coolify-monorepo-setup.md)

## Coolify UI checklist (per resource) — staging / Alpha

Use these exact settings for **Troott Website** (adjust paths/ports for API or Studio):

| Field | Staging (Alpha) |
| ----- | --------------- |
| Build Pack | **Docker Compose** |
| Base Directory | `/` or empty |
| Docker Compose Location | `deploy/coolify/docker-compose.website.yaml` |
| Git Source | `thetroott/troott` |
| Domains | `https://staging.troott.com` (or temporary Alpha host) |
| Domain → port | **3000** |
| Environment | `GHCR_ORG=thetroott`, **`IMAGE_TAG=staging`** |
| API runtime | `APP_ENV=staging`, `NODE_ENV=staging` (not `production`) |
| Registry | ghcr.io credentials if packages are private |

After Save → **Reload Compose File**. The raw compose editor must show the `website:` service. If empty, Traefik returns **no available server**.

Docker builds from repo root must include `patches/` and `configs/` in the image context (see [feat-0005](../../specs/platform/feature/feat-0005/TECH.md)).
