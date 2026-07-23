# feat-0038: Implementation tasks

Parent: [PRODUCT.md](./PRODUCT.md) | [TECH.md](./TECH.md)

## Phase 0R — Reproduce error **before** any fix

> **Blocker for Phase 1 ops.** Complete [PRODUCT — Reproduce the error before fixing](./PRODUCT.md#reproduce-the-error-before-fix-required).

- [ ] **T0R.1** Staging web + API reachable (no Bad Gateway / Exited).
- [ ] **T0R.2** Run full Progress upload with ≥10 MB audio until error appears.
- [ ] **T0R.3** Confirm Network: multipart `create` (Uppy path), not legacy-only `start-upload`.
- [ ] **T0R.4** Confirm Coolify API logs: `create` → repeated `sign-part` → `abort` for one `sessionId`.
- [ ] **T0R.5** Confirm CORS evidence: API `Not allowed by CORS` **and/or** S3 PUT CORS/failed fetch in browser.
- [ ] **T0R.6** Save artifacts (screenshot, HAR/Network, console, API log paste, `sessionId`, file size, UTC time).
- [ ] **T0R.7** Optional: Retry once without re-selecting file — confirm still fails.
- [ ] **T0R.8** Write “Reproduced: YES” + artifact links/paths in the PR or incident note **before** changing Coolify/S3 CORS.

## Phase 0 — Diagnose staging (parallel with 0R OK; no Coolify/S3 fixes yet)

- [x] **T0.6** Classify path: **Uppy** confirmed (API logs 2026-07-23). See [PRODUCT Evidence](./PRODUCT.md#evidence--staging-api-logs-2026-07-23).
- [ ] **T0.1** Confirm Coolify `troott-api-staging` is Running (not Exited).
- [ ] **T0.2** Confirm Coolify `troott-app-staging` serves `https://app.staging.troott.com` (port **8080**, `IMAGE_TAG=staging`).
- [ ] **T0.3** Confirm GHCR tags exist: `troott-api:staging`, `troott-web:staging`.
- [ ] **T0.4** Confirm GitHub Environment `staging` has correct `API_URL` / `WEB_URL`.
- [ ] **T0.5** Browser Network classification *(covered by T0R when running Phase 0R)*.
- [ ] **T0.7** Dump Coolify API CORS env: `CORS_ALLOWED_ORIGINS`, `CLIENT_STAGING_*`.

## Phase 1 — Ops / infra (only after Phase 0R) — **manual Coolify / AWS**

- [ ] **T1.0** Set Coolify API CORS allowlist per [TECH §3.1](./TECH.md#31-api-cors-allowlist-troott-originutil); redeploy API.
- [ ] **T1.1** Apply S3 CORS from [`docs/staging-s3-cors.json.example`](../../../../docs/staging-s3-cors.json.example); retest — no `abort`.
- [ ] **T1.2** Fix API crash/env if needed (`NODE_ENV=staging`, Mongo, Redis, `$$` for `$` secrets).
- [ ] **T1.3** Legacy-only `start-upload` for large files → redeploy web with Uppy *(N/A if logs show multipart)*.
- [ ] **T1.4** Busboy ~70% path — only if legacy `start-upload`.
- [ ] **T1.5** Drop or allowlist `www.app.staging.troott.com`.
- [ ] **T1.6** Re-run reproduce steps — expect success; keep before/after artifacts.

## Phase 2 — Client error UX (`apps/web`) — **done in repo**

- [x] **T2.1** Persist last upload error (`uploadErrorDetail` in `UploadProgressStep`).
- [x] **T2.2** Render actionable message on Progress (keep Retry).
- [x] **T2.3** `sermon-upload-error-message.util.ts` (+ vitest) per TECH §5.2.
- [x] **T2.4** Clear detail on Retry.

## Phase 2b — API observability / samples — **done in repo**

- [x] **T2b.1** Log `[cors] Not allowed by CORS origin=…` in `app.config.ts`.
- [x] **T2b.2** Staging checklist in `apps/api/example.env`.
- [x] **T2b.3** `docs/staging-s3-cors.json.example`.

## Phase 3 — API / contract verification

- [ ] **T3.1** Smoke staging multipart `create`.
- [ ] **T3.2** Smoke `complete-audio` after parts.
- [ ] **T3.3** Confirm feat-0018 routes on staging image.

## Phase 4 — Acceptance

- [ ] **T4.1** Staging ≥10 MB → Progress complete.
- [ ] **T4.2** Staging large file → complete or clear size error.
- [ ] **T4.3** Forced network failure → actionable copy + Retry.
- [ ] **T4.4** Note root cause + before/after artifacts in PR.

## Exit criteria

Phase 0R done → Phase 1 Coolify/S3 CORS applied → Phase 2/2b web+API images deployed → Phase 4 green.
