# Coolify — pre-built GHCR images

GitHub Actions builds and pushes images; Coolify **pulls** them (no Dockerfile build on the server).

| App | Compose file | GHCR image | Container port | Domain |
| --- | ------------ | ---------- | -------------- | ------ |
| API | `docker-compose.api.yaml` | `ghcr.io/<org>/troott-api:<env>` | 5025 | api.troott.com |
| Studio web | `docker-compose.web.yaml` | `ghcr.io/<org>/troott-web:<env>` | 8080 | app.troott.com |
| Marketing | `docker-compose.website.yaml` | `ghcr.io/<org>/troott-website:<env>` | 3000 | troott.com |

`<env>` = `development` | `staging` | `production` (matches Git branch deploy).

Setup: [docs/coolify-monorepo-setup.md](../../docs/coolify-monorepo-setup.md)

Docker builds from repo root must include `patches/` and `configs/` in the image context (see [feat-0005](../../specs/platform/feature/feat-0005/TECH.md)).
