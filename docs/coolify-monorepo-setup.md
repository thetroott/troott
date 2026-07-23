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

Create **six** Coolify resources if you run staging + production (three surfaces × two environments). Do not reuse production UUIDs for staging.

| Troott app | Compose file | GHCR image | Coolify port |
| ---------- | ------------ | ---------- | ------------ |
| API | `deploy/coolify/docker-compose.api.yaml` | `ghcr.io/<org>/troott-api:<tag>` | 5025 |
| Studio | `deploy/coolify/docker-compose.web.yaml` | `ghcr.io/<org>/troott-web:<tag>` | 8080 |
| Marketing | `deploy/coolify/docker-compose.website.yaml` | `ghcr.io/<org>/troott-website:<tag>` | 3000 |

`<tag>` = `IMAGE_TAG` = `staging` \| `production` \| `development`.

### Configuration (all three)

- **Source**: GitHub `thetroott/troott` (branch per environment, or same branch with different `IMAGE_TAG`).
- **Build Pack**: **Docker Compose** (not Dockerfile, not Nixpacks). Images are built in **GitHub Actions** and pushed to GHCR; Coolify only **pulls** them.
- **Base Directory**: `/` (repo root). Leave empty if Coolify treats that as root.
- **Docker Compose Location**: path in table above (repo-relative), e.g. `deploy/coolify/docker-compose.website.yaml`.
- **Preserve Repository During Deployment**: enabled (recommended).
- After saving, click **Reload Compose File** (or **Save & Reload Compose File**). The **Docker Compose Content (raw)** box must show the `services:` block from that file. If it stays **empty**, Traefik has nothing to route and browsers show **no available server**.
- **Do not** set Base Directory to `apps/website/Dockerfile` or switch to **Dockerfile / Nixpacks** on Coolify — that breaks the GHCR pull model and causes phantom “healthy” containers with no app behind Traefik.

### Domains (critical for Traefik)

Enter **full URLs with protocol**, not bare hostnames:

| App | Staging domains | Production domains | Port |
| --- | --------------- | ------------------ | ---- |
| Website | `https://staging.troott.com` | `https://troott.com,https://www.troott.com` | **3000** |
| Studio | `https://app.staging.troott.com` | `https://app.troott.com` | **8080** |
| API | `https://api.staging.troott.com` | `https://api.troott.com` | **5025** |

Wrong domain format (e.g. `troott.com` without `https://`) can produce broken Traefik rules like `Host(\`\`) && PathPrefix(\`troott.com\`)` and **no available server** / 503. After changing domains, **Redeploy**.

In **Advanced**, disable **Strip Prefixes** unless you intentionally need path stripping.

### Required resource environment variables

| Variable | Staging | Production | Notes |
| -------- | ------- | ---------- | ----- |
| `GHCR_ORG` | `thetroott` | `thetroott` | Lowercase; must match CI push namespace |
| `IMAGE_TAG` | `staging` | `production` | Must match GHCR floating tag from Deploy workflow |

If Coolify shows `ghcr.io/.../troott-api:staging: not found`, run GitHub **Deploy** for environment **staging** first so the tag exists.

Set runtime secrets (MongoDB, JWT, AWS, etc.) in Coolify as usual — not in this doc. For staging API use `NODE_ENV=staging`, `APP_ENV=staging`, `MONGODB_STAGING_URI`, and mark those **Runtime only**.

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

Increase Coolify deploy timeout or server disk; studio/web images include Caddy/static assets.

### 4.5 Empty “Docker Compose Content (raw)” / no available server

Symptoms: resource shows **Running (healthy)** but `https://troott.com` returns Traefik **no available server**; raw compose box is blank.

**Do not** switch to Dockerfile or Nixpacks — use **Docker Compose** + GHCR images from CI.

Fix:

1. **Build Pack** = **Docker Compose**.
2. **Base Directory** = repo root (`/` or empty).
3. **Docker Compose Location** = `deploy/coolify/docker-compose.website.yaml` (or `.api.yaml` / `.web.yaml` for other apps).
4. **Git Source** connected; branch includes that file (e.g. `master`).
5. Click **Save**, then **Reload Compose File**. Raw box should list `services: website:` with `image: ghcr.io/...`.
6. If reload still fails, paste the file contents from the repo into the raw box manually, then Save.
7. Set **Environment Variables**: `GHCR_ORG=thetroott`, `IMAGE_TAG=staging` (or `production`).
8. **Domains**: staging `https://staging.troott.com` or production `https://troott.com,https://www.troott.com` with port **3000**.
9. **Redeploy** (Force Stop in Danger Zone first if a phantom deployment persists).

Verify on server:

```bash
docker inspect <website-container> --format '{{json .Config.Labels}}' | jq 'with_entries(select(.key|test("traefik")))'
```

Router rule should include `Host(\`troott.com\`)` or `Host(\`www.troott.com\`)`, not empty `Host(\`\`)`.

### 4.6 SSL / ERR_CERT_AUTHORITY_INVALID

See section **Domains** above. Ensure port **80/443** open on the server, Let’s Encrypt enabled per domain, and HTTP routers exist during certificate issuance (temporarily disable **Force HTTPS** if ACME HTTP-01 returns 404).

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
