# feat-0005: Tech — Docker configs context and API type isolation

## Context

Deploy run **#6** (`fix(api): seed JWT_EXPIRY…`). Patches fix (feat-0004) unblocked `pnpm install`; **build** stage fails next.

---

## Failure inventory

| ID | Job | Log excerpt | Root cause |
| -- | --- | ----------- | ---------- |
| B1 | troott-web | `failed to resolve "extends":"../../configs/typescript/base.app.json"` | `configs/` not in image at Vite build |
| B2 | troott-website | `Cannot read file '/app/configs/typescript/nextjs.json'` | same |
| B3 | troott-api | `react-native/.../globals.d.ts` vs `lib.dom.d.ts` duplicate identifiers | Missing tsconfig extends → bad compiler defaults + hoisted RN types in `/app/node_modules` |

---

## Fix 1 — `COPY configs` in Dockerfiles (P0)

Align with Pacepard (`apps/api/Dockerfile`, `apps/web/Dockerfile`):

In **deps** and **build** stages of `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/website/Dockerfile`:

```dockerfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY configs ./configs
COPY apps/<app>/package.json apps/<app>/
```

Build stage (when copying sources):

```dockerfile
COPY configs ./configs
COPY apps/<app> ./apps/<app>
```

`configs/` includes:

- `configs/typescript/*` — tsconfig extends (required for build)
- `configs/eslint/*` — workspace package `@troott/configs/eslint` (devDependency of web/website)

No `packages/` copy required for current app dependency graph.

---

## Fix 2 — API `types` isolation (P1)

In `apps/api/tsconfig.json`:

```json
"compilerOptions": {
  "types": ["node"]
}
```

Limits ambient `@types` to Node only; prevents hoisted `react-native` shipping global DOM shims into API `tsc` when root workspace installs mobile deps during filtered Docker install.

Verified: `pnpm typecheck:api` and `pnpm --filter @troott/api build` pass locally.

---

## Verification

```bash
pnpm typecheck:api
pnpm build:ci

docker build -f apps/api/Dockerfile -t troott-api:local .
docker build -f apps/web/Dockerfile -t troott-web:local \
  --build-arg VITE_APP_API_URL=https://api.example.com \
  --build-arg VITE_APP_ENVIRONMENT=prod .
docker build -f apps/website/Dockerfile -t troott-website:local \
  --build-arg NEXT_PUBLIC_APP_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_APP_ENVIRONMENT=production .
```

---

## Regression checklist

When adding a new shared workspace path referenced at build time (e.g. new `configs/*` or `packages/*` workspace dep):

1. Confirm local `pnpm build:ci` uses it.
2. Add `COPY` to all affected app Dockerfiles deps/build stages.
3. Document in this spec or `deploy/coolify/README.md`.

---

## Implementation checklist

| File | Change |
| ---- | ------ |
| `apps/api/Dockerfile` | `COPY configs` deps + build |
| `apps/web/Dockerfile` | same |
| `apps/website/Dockerfile` | same |
| `apps/api/tsconfig.json` | `"types": ["node"]` |
| `specs/platform/feature/feat-0004/TECH.md` | cross-link feat-0005 (optional) |
