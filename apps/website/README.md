# @troott/website

Next.js 15 marketing site (`troott.com`).

## Local development

From the monorepo root:

```bash
pnpm dev:website
```

Or from this directory:

```bash
pnpm dev
```

Dev server: **http://localhost:3051** (`next dev --turbopack -p 3051`).

## Environment

Copy `.env.sample` to `.env`:

```bash
cp .env.sample .env
```

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_APP_API_URL` | Troott API origin (e.g. `http://localhost:5025`) |
| `NEXT_PUBLIC_APP_ENVIRONMENT` | `development` locally |
| `MAILERLITE_API_KEY` | Server-only — newsletter subscribe route |
| `MAILERLITE_GROUP_ID` | Server-only — MailerLite group |

## Production (Docker)

Build from repo root:

```bash
docker build -f apps/website/Dockerfile -t troott-website \
  --build-arg NEXT_PUBLIC_APP_API_URL=https://api.troott.com .
```

Container listens on **port 3000** (`next start` standalone).
