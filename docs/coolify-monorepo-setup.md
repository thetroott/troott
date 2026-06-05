# Coolify monorepo setup (Troott)

GitHub Actions builds Docker images and pushes to **GHCR**. Coolify **pulls** those images via Docker Compose — it does not build from `Dockerfile` on the server.

Reference compose files: [`deploy/coolify/`](../deploy/coolify/README.md)

## 1. GitHub

1. Repo **Settings → Actions → General → Workflow permissions**: allow **Read and write** (needed for `packages: write` / GHCR push).
2. After first successful deploy workflow, packages appear under **Packages**:
   - `troott-api`
   - `troott-web` (studio portal)
   - `troott-website` (marketing)
3. Tags per environment: `production`, `staging`, `development`, plus immutable `production-abc1234`.

## 2. Coolify application (each app)

Create one Coolify resource per surface (API, studio web, marketing).

| Troott app | Compose file | GHCR image | Coolify port |
| ---------- | ------------ | ---------- | ------------ |
| API | `deploy/coolify/docker-compose.api.yaml` | `ghcr.io/<org>/troott-api:<tag>` | 5025 |
| Studio (`app.troott.com`) | `deploy/coolify/docker-compose.web.yaml` | `ghcr.io/<org>/troott-web:<tag>` | 8080 |
| Marketing (`troott.com`) | `deploy/coolify/docker-compose.website.yaml` | `ghcr.io/<org>/troott-website:<tag>` | 3000 |

### Configuration (all three)

- **Source**: GitHub `thetroott/troott` (branch per environment, or same branch with different `IMAGE_TAG`).
- **Build Pack**: **Docker Compose** (not Dockerfile).
- **Docker Compose Location**: path in table above (repo-relative).
- **Do not** set Base Directory to `apps/web/Dockerfile` — that causes `mkdir .../Dockerfile: File exists`.

### Required resource environment variables

| Variable | Example | Notes |
| -------- | ------- | ----- |
| `GHCR_ORG` | `thetroott` | Lowercase GitHub org/user; must match CI push namespace |
| `IMAGE_TAG` | `production` | `development` \| `staging` \| `production` — matches deploy branch env |

Set runtime secrets (MongoDB, JWT, AWS, etc.) in Coolify as usual — not in this doc.

## 3. GitHub → Coolify trigger

`deploy.yml` pushes images then calls Coolify `GET /api/v1/deploy?uuid=...`.

Secrets: `COOLIFY_API_TOKEN`, `COOLIFY_APP_UUID_API`, `COOLIFY_APP_UUID_WEB`, `COOLIFY_APP_UUID_WEBSITE`.

Variables: `COOLIFY_API_URL`, `API_URL`, `WEB_URL`, `WEBSITE_URL`.

## 4. Troubleshooting

### 4.1 `unauthorized` or `manifest unknown` on pull

- Image not pushed yet — run **Deploy** workflow on GitHub and confirm **Build and push** jobs succeed.
- Wrong `GHCR_ORG` or `IMAGE_TAG` in Coolify.
- Private package: **Coolify → Keys & Tokens → Docker Registry** — add `ghcr.io` with a GitHub PAT (`read:packages`), or make the package public under GitHub Package settings.

### 4.2 `mkdir .../Dockerfile: File exists`

Coolify is set to **Dockerfile** build pack or Base Directory includes `Dockerfile`. Switch to **Docker Compose** and compose path from section 2.

### 4.3 Secrets with `$` (bcrypt, etc.)

Compose interpolates `$`. In Coolify env values that flow into compose, escape dollars as `$$` per compose file comments in `deploy/coolify/docker-compose.api.yaml`.

### 4.4 Large image / exit 255 during extract

Increase Coolify deploy timeout or server disk; studio/web images include nginx + static assets.

## 5. Local smoke test

```bash
# From repo root — same Dockerfiles CI uses
docker build -f apps/api/Dockerfile -t troott-api:local .
docker build -f apps/web/Dockerfile -t troott-web:local \
  --build-arg VITE_APP_API_URL=https://api.troott.com \
  --build-arg VITE_APP_ENVIRONMENT=prod .
docker build -f apps/website/Dockerfile -t troott-website:local \
  --build-arg NEXT_PUBLIC_APP_API_URL=https://api.troott.com \
  --build-arg NEXT_PUBLIC_APP_ENVIRONMENT=production .
```
