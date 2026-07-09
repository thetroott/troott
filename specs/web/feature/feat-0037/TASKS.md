# feat-0037: Implementation tasks (Web — Uppy S3)

Parent: [PRODUCT.md](./PRODUCT.md) | [TECH.md](./TECH.md) | API: [feat-0018 TASKS](../../api/feature/feat-0018/TASKS.md)

> **ID note:** Upload **polling** after audio complete is [web feat-0018 UPLOAD_STATUS_POLLING_SPEC](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) — not this feature.

## P0 order

- [ ] **W1 — API paths + clients**
  - Acceptance: multipart path constants in `api/core/paths.ts`; methods on `sermon.ts` + `storage.ts`
  - Verify: `pnpm --filter @troott/web exec tsc --noEmit`
  - Files: `api/core/paths.ts`, `api/clients/sermon.ts`, `api/clients/storage.ts`

- [ ] **W2 — Sermon audio (primary)**
  - Acceptance: Uppy + signing callbacks in `sermon-upload.service.ts`; progress + abort; parse `sermonId`/`uploadRef` (API TECH §15)
  - Verify: manual 50 MB upload after API T3 deployed
  - Files: `services/upload/sermon-upload.service.ts`

- [ ] **W3 — Wire `useStudioSermonAudioUpload`**
  - Acceptance: single-flight preserved ([feat-0008](../feat-0008/TECH.md)); cancel + `AbortSignal`; optional resume in hook/service (TECH §9–10)
  - Verify: network tab — 1× create per file; S3 PUTs not to API host
  - Files: `hooks/upload/useStudioSermonAudioUpload.ts`, `UploadProgressStep.tsx`

- [ ] **W4 — Storage + cover**
  - Acceptance: Uppy branches in `storage-upload.service.ts` + `sermon-cover-upload.service.ts`; two-step cover (API TECH §17)
  - Verify: 10 MB cover on Details step ([feat-0032](../feat-0032/PRODUCT.md))
  - Files: `sermon-cover-upload.service.ts`, `storage-upload.service.ts`

- [ ] **W5 — Call sites**
  - Acceptance: KYC, profile banner/avatar, `SermonEditPage` cover use existing upload services
  - Files: `hooks/app/useDocumentVerification.ts`, profile settings, `app/studio/SermonEditPage.tsx`

## P1

- [ ] **W6 — Drive batch** — max 2 concurrent in hook/service; Google Picker → `startSermonAudioUpload` per file

## Dependencies

```text
API T3 complete before W2 manual smoke
W1 → W2 → W3
W1 → W4 → W5
```
