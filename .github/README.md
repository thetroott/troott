# GitHub Actions — feat-0001 CI/CD

Configure these in the GitHub repo before the first deploy.

## Environments

Create GitHub Environments: `development`, `staging`, `production`.

Optional: require reviewers on `production`.

## Repository variables

| Variable | Example |
| -------- | ------- |
| `COOLIFY_API_URL` | `https://coolify.example.com` |
| `API_URL` | `https://api.troott.com` |
| `WEB_URL` | `https://app.troott.com` |
| `WEBSITE_URL` | `https://troott.com` |
| `TURBO_TEAM` | *(optional)* Turbo remote cache team |

Per-environment overrides are supported when variables are set on each Environment.

## Repository secrets

| Secret | Used by |
| ------ | ------- |
| `COOLIFY_API_TOKEN` | `deploy.yml` |
| `COOLIFY_APP_UUID_API` | API → api.troott.com |
| `COOLIFY_APP_UUID_WEB` | Studio portal → app.troott.com |
| `COOLIFY_APP_UUID_WEBSITE` | Marketing → troott.com |
| `TURBO_TOKEN` | CI/CD build cache *(optional)* |
| `EXPO_TOKEN` | `mobile-eas.yml` |

Build job injects `VITE_APP_API_URL` and `NEXT_PUBLIC_APP_API_URL` from the `API_URL` variable when running `pnpm build:ci`.

## Workflows

| File | Trigger | Purpose |
| ---- | ------- | ------- |
| `ci.yml` | PR + push to main branches | Lint, typecheck, build, expo-doctor |
| `deploy.yml` | Push to `development` / `staging` / `main`, manual | Coolify deploy api + web + website |
| `mobile-eas.yml` | Manual | EAS build for `@troott/mobile` |

Spec: [`specs/platform/feature/feat-0001/PRODUCT.md`](../../specs/platform/feature/feat-0001/PRODUCT.md)
