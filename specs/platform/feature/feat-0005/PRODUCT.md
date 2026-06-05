# feat-0005: Docker build context — shared configs and API types

## Summary

After [feat-0004](../feat-0004/PRODUCT.md) fixed pnpm `patches/` ENOENT, **Deploy #6** still fails at **`pnpm build`** in all three app Dockerfiles:

| Image | Error |
| ----- | ----- |
| troott-web | Vite cannot resolve `extends` → `configs/typescript/base.app.json` |
| troott-website | Next.js TS5083: cannot read `configs/typescript/nextjs.json` |
| troott-api | `tsc` — react-native global types vs `lib.dom` (100+ TS errors) |

Root cause: Docker **deps/build stages** copy app source and lockfile but **not** `configs/`, while every app `tsconfig` extends shared JSON under `configs/typescript/`. API failures are worsened by hoisted root `react-native`/`expo` deps polluting `tsc` when shared tsconfig is missing.

**Follow-up to:** feat-0004 (patches), feat-0001 (GHCR deploy).

---

## Goals

1. All three **Build and push** jobs succeed on GitHub Actions.
2. Docker builds match local `pnpm build:ci` behavior for tsconfig resolution.
3. API `tsc` in container does not pull React Native ambient types from root workspace deps.

---

## Acceptance criteria

- [ ] `docker build -f apps/{api,web,website}/Dockerfile .` succeeds from repo root (with web/website build-args).
- [ ] Deploy workflow **Build and push** jobs green for api, web, website.
- [ ] `pnpm typecheck:api` still passes locally after any tsconfig hardening.

---

## Out of scope

- Moving `expo` / `react-native` off root `package.json` (mobile workspace refactor).
- Full Pacepard-style Dockerfile rewrite (single-stage turbo build all packages).
- `packages/ui` in Docker context (web/website do not depend on it today).

---

## References

- Pacepard pattern: `COPY configs ./configs` before install/build in app Dockerfiles.
- Troott tsconfig extends: `apps/*/tsconfig*.json` → `../../configs/typescript/*.json`
