# feat-0004: Tech — Docker patches and Jest JWT bootstrap

## Context

GitHub Actions **Deploy #5** and **CI #6** after GHCR workflow merge. See [PRODUCT.md](./PRODUCT.md).

**Normative repro:**

```bash
pnpm install --frozen-lockfile

# CI failure
pnpm --filter @troott/api test:ci

# Deploy failure (same as Actions docker buildx)
docker build -f apps/api/Dockerfile -t troott-api:local .
docker build -f apps/web/Dockerfile -t troott-web:local \
  --build-arg VITE_APP_API_URL=https://api.example.com \
  --build-arg VITE_APP_ENVIRONMENT=prod .
docker build -f apps/website/Dockerfile -t troott-website:local \
  --build-arg NEXT_PUBLIC_APP_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_APP_ENVIRONMENT=production .
```

---

## Failure inventory

| ID | Symptom | Location | Priority |
| -- | ------- | -------- | -------- |
| D1 | `ENOENT … patches/react-native-css-interop@0.2.2.patch` | `apps/api/Dockerfile` deps stage | P0 |
| D2 | `ENOENT … patches/@rntp__player@5.0.0-beta.4.patch` | `apps/web/Dockerfile`, `apps/website/Dockerfile` | P0 |
| T1 | `JWT_EXPIRY is not defined` | `sermon.router-order.test.ts` → `token.service.ts` | P0 |

---

## 1. Docker — include `patches/` in deps stage (P0)

### Why filter install still needs patches

Root `pnpm-workspace.yaml` and `package.json` declare:

```yaml
patchedDependencies:
  '@rntp/player@5.0.0-beta.4': patches/@rntp__player@5.0.0-beta.4.patch
  react-native-css-interop@0.2.2: patches/react-native-css-interop@0.2.2.patch
```

`pnpm install --frozen-lockfile --filter @troott/api...` validates patch files listed in the lockfile **before** installing the filtered subgraph. Missing files → exit 254.

### Fix

In **each** of `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/website/Dockerfile`, in the `deps` stage, after copying workspace manifests:

```dockerfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY apps/<app>/package.json apps/<app>/
RUN pnpm install --frozen-lockfile --filter @troott/<app>...
```

No change to install flags or lockfile.

### Regression guard

When adding a new entry under `pnpm.patchedDependencies`, ensure Docker deps stages still `COPY patches/`. Optional future: CI step `grep -q 'COPY patches' apps/*/Dockerfile` (not required for this feat).

### Verification

```bash
docker build -f apps/api/Dockerfile -t troott-api:local .
# repeat web + website
```

---

## 2. Jest — seed `JWT_EXPIRY` in global setup (P0)

### Symptom

```
TokenService constructor → JWT_EXPIRY is not defined
  at sermon.router-order.test.ts (imports sermon.router → checkAuth.mdw → token.service)
```

### Current bootstrap

`apps/api/test/setup-jest.ts` sets `JWT_SECRET` only.

### Fix

Add test default aligned with `apps/api/example.env`:

```typescript
if (!process.env.JWT_EXPIRY) {
    process.env.JWT_EXPIRY = '30d';
}
```

### Alternatives rejected

| Option | Why not |
| ------ | ------- |
| Mock `checkAuth` in router-order test | Test purpose is route registration order on real router stack. |
| Mock `token.service` module | Hides real import chain; other router tests may hit same gap. |
| Skip test in CI | Loses route-order regression guard. |

### Verification

```bash
pnpm --filter @troott/api test:ci
pnpm test:ci   # from repo root
```

---

## 3. Implementation checklist

| File | Change |
| ---- | ------ |
| `apps/api/Dockerfile` | `COPY patches ./patches` in deps |
| `apps/web/Dockerfile` | same |
| `apps/website/Dockerfile` | same |
| `apps/api/test/setup-jest.ts` | default `JWT_EXPIRY` |
| `docs/coolify-monorepo-setup.md` | note patches in Docker context (optional one line) |
| `docs/CI_GUARDRAILS.md` | add docker build smoke to parity script (optional) |

---

## 4. Out of scope (P2+)

- Restore `environment.url` on deploy jobs (GitHub Deployments UI only).
- Remove unused CI build artifacts (feat-0001 polish).
- Pin TruffleHog / checkout action versions.

---

## 5. Post-merge verification

1. Push to `master` (or re-run failed workflows).
2. Confirm Deploy: all three **Build and push** jobs green; images visible on GHCR.
3. Confirm CI: **Test** + **CI success** green.
