# feat-0018: Implementation tasks (API — S3 multipart)

Parent: [PRODUCT.md](./PRODUCT.md) | [TECH.md](./TECH.md) | Web: [feat-0037 TASKS](../../web/feature/feat-0037/TASKS.md)

## P0 order (merge as separate PRs if needed)

- [ ] **T1 — Config + session model**
  - Acceptance: `s3-multipart.config.ts`, Mongo `S3MultipartSession` with TTL index
  - Verify: `pnpm --filter @troott/api exec tsc --noEmit`
  - Files: `configs/s3-multipart.config.ts`, `models/` or `schemas/`, `example.env`

- [ ] **T2 — Storage routes**
  - Acceptance: `/storage/s3/multipart/*` + `complete` returns `ImageDTO` envelope; AWS SDK + session CRUD in controller
  - Verify: `s3-multipart.storage.complete.test.ts`
  - Files: `controllers/s3-multipart.storage.controller.ts`, `routes/s3-multipart.storage.router.ts`

- [ ] **T3 — Sermon audio routes**
  - Acceptance: `/sermon/s3/multipart/*` + `complete-audio`; minister gate; rate limits
  - Verify: `s3-multipart.sermon.complete-audio.test.ts` (idempotent retry)
  - Files: `controllers/s3-multipart.sermon.controller.ts`, `routes/s3-multipart.sermon.router.ts`

- [ ] **T4 — `completeS3AudioUpload` refactor**
  - Acceptance: `handleUploadSermon` + `completeS3AudioUpload` share one job-enqueue path; owner/minister parity (TECH §16)
  - Verify: existing sermon upload tests still pass
  - Files: `services/core/sermon.service.ts`

- [ ] **T5 — Cover complete**
  - Acceptance: `complete-cover` two-step (TECH §17); owner gate
  - Verify: `s3-multipart.sermon.complete-cover.test.ts`
  - Files: `completeS3CoverUpload` in sermon.service

- [ ] **T6 — Cleanup job + logging**
  - Acceptance: stale sessions aborted; structured logs (TECH §20)
  - Verify: manual or unit test for cleanup handler
  - Files: `tasks/jobs/cleanup.job.ts`

- [ ] **T7 — Ops: S3 CORS + IAM**
  - Acceptance: CORS on `troott-originals` + `troott-storage` for prod/staging/local origins (TECH §20)
  - Verify: browser PUT from `localhost:5053` returns `ETag` header
  - Files: infra runbook note in TECH §20 (no code)

## Dependencies

```text
T1 → T2,T3 (parallel) → T4 → T5
T1 → T6
T7 before web E2E smoke
```
