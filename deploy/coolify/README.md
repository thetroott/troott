# Coolify — pre-built GHCR images

GitHub Actions builds and pushes images; Coolify **pulls** them (no build on the server).

| App | Compose file | GHCR image | Container port | Domain |
| --- | ------------ | ---------- | -------------- | ------ |
| API | `docker-compose.api.yaml` | `ghcr.io/<org>/troott-api:<env>` | 5025 | api.troott.com |
| Studio web | `docker-compose.web.yaml` | `ghcr.io/<org>/troott-web:<env>` | 8080 | app.troott.com |
| Marketing | `docker-compose.website.yaml` | `ghcr.io/<org>/troott-website:<env>` | 3000 | troott.com |

`<env>` = `development` | `staging` | `production` (matches Git branch deploy).

Setup: [docs/coolify-monorepo-setup.md](../../docs/coolify-monorepo-setup.md)

## Coolify UI checklist (per resource)

Use these exact settings for **Troott Website** (adjust paths/ports for API or Studio):

| Field | Value |
| ----- | ----- |
| Build Pack | **Docker Compose** (not Dockerfile, not Nixpacks) |
| Base Directory | `/` or empty (monorepo root) |
| Docker Compose Location | `deploy/coolify/docker-compose.website.yaml` |
| Git Source | `thetroott/troott`, branch with compose file |
| Domains | `https://troott.com,https://www.troott.com` (include `https://`) |
| Domain → port | **3000** |
| Environment | `GHCR_ORG=thetroott`, `IMAGE_TAG=production` |
| Registry | ghcr.io credentials if packages are private |

After Save → **Reload Compose File**. The raw compose editor must show the `website:` service. If empty, Traefik returns **no available server**.

Docker builds from repo root must include `patches/` and `configs/` in the image context (see [feat-0005](../../specs/platform/feature/feat-0005/TECH.md)).
