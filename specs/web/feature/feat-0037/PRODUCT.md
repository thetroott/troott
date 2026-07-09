# feat-0037: Resumable uploads — Uppy direct to S3 (all surfaces)

> **ID disambiguation:** This is the **web Uppy client** spec (`specs/web/feature/feat-0037/`).  
> **API** S3 signing is [feat-0018 API](../../../api/feature/feat-0018/PRODUCT.md).  
> **Upload polling** after audio completes is [web feat-0018 UPLOAD_STATUS_POLLING_SPEC](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) — not this feature.  
> Web feat-0018 **PRODUCT** covers My Sermons / library Figma surfaces.  
> Implementation tasks: [TASKS.md](./TASKS.md).

## Summary

Every Troott file upload in **`apps/web`** must support **resumable direct-to-S3 transfer** when appropriate. **Sermon audio** is the primary use case: ministers upload large MP3/M4A files in the studio wizard and (later) **batch imports from Google Drive**.

The API orchestrates S3 multipart with presigned URLs ([feat-0018 API](../../../api/feature/feat-0018/PRODUCT.md)). The web client uses **[Uppy](https://uppy.io)** (`@uppy/core` + `@uppy/aws-s3`) with **custom signing callbacks** to the Troott API — **not TUS**, **not tus-js-client**, **not Uppy Companion** as a deployed service.

Existing upload UI (Progress step, cover tile, KYC) stays; Uppy runs **headless** (no `@uppy/dashboard` required for P0 wizard).

---

## Upload inventory (web)

| # | Surface | Module | Legacy (≤6 MB) | Uppy + S3 |
| - | ------- | ------ | -------------- | --------- |
| 1 | **Sermon audio** | `sermon-upload.service.ts` → `useStudioSermonAudioUpload` | `POST /sermon/start-upload` | `@uppy/aws-s3` → `/sermon/s3/multipart/*` |
| 2 | **Sermon cover** | `sermon-cover-upload.service.ts` | `POST /sermon/image-upload` | Uppy → `/storage/s3/multipart/*` + `complete-cover` |
| 3 | **Storage image** | `storage-upload.service.ts` | `POST /storage/upload` | Uppy → `/storage/s3/multipart/*` |
| 4 | **Storage document** | `storage-upload.service.ts` | `POST /storage/upload-document` | Uppy → `/storage/s3/multipart/*` |

---

## When to use Uppy S3 vs legacy multipart

| Surface | Uppy direct S3 | Legacy Axios multipart |
| ------- | -------------- | ---------------------- |
| **Sermon audio** | **Always** (default) | `file.size ≤ 6_291_456` + `forceMultipart` (tests only) |
| Sermon cover | `file.size > 6_291_456` | `file.size ≤ 6_291_456` |
| Storage image / document | `file.size > 6_291_456` | `file.size ≤ 6_291_456` |
| **Drive batch** | Uppy file queue, **max 2 concurrent** | — |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-WU01 | Minister | Audio uploaded **direct to S3** with resume | API bandwidth stays low; uploads survive disconnects |
| UC-WU02 | Minister | Progress from Uppy `upload-progress` on Progress step | Real byte progress |
| UC-WU03 | Minister | Same `sermonId` after `complete-audio` | Wizard + polling unchanged ([feat-0006](../../../api/feature/feat-0006/PRODUCT.md)) |
| UC-WU04 | Minister | Drive batch queued (1–2 at a time) | Many sermons without overloading API/S3 |
| UC-WU05 | Minister | Large cover / KYC via Uppy S3 | Reliable large file UX |
| UC-WU06 | Engineer | Uppy wired in existing upload services only | No TUS; no Companion; no shared util package |
| UC-WU07 | Minister | Resume after refresh when same file is re-selected | `listParts` + persisted `sessionId` when possible |
| UC-WU08 | Minister | Cancel upload clears in-flight state | Abort S3 multipart + feat-0008 flight cleared |

---

## Scope

### In scope (P0)

- `pnpm add @uppy/core @uppy/aws-s3`
- Headless Uppy in **existing upload services** (not Dashboard in wizard)
- Custom signing callbacks inline in each service (`create` / `signPart` / `listParts` / `complete` / `abort`)
- Wire sermon audio into `useStudioSermonAudioUpload` / `UploadProgressStep`
- Cover, KYC, profile via `storage-upload.service.ts`
- Progress → existing Redux upload state / hook state
- feat-0008 single-flight per file signature
- Resume: optional `localStorage` in service/hook (see TECH §9)
- Cancel: `uppy.cancelAll()` + `POST …/abort` (see TECH §10)

### Out of scope (P0)

- `@uppy/dashboard` full UI replacement
- `@uppy/google-drive` (P1 — needs Picker or Companion)
- `@uppy/tus` plugin
- Mobile Expo
- `packages/upload`
- New `utils/*` or `lib/uppy/*` abstraction layers

### P1

- `@uppy/google-drive` or Google Picker → `uppy.addFile()` for batch Drive import
- Optional `@uppy/dashboard` for dedicated bulk import page

---

## UX

| State | Audio | Cover / storage |
| ----- | ----- | ----------------- |
| Uploading | Uppy `upload-progress` → `uploadActions.setProgress` | Hook / tile % |
| Paused / retry | Uppy retries parts; show "Resuming…" | Same |
| Cancel | `uppy.cancelAll()` + abort API; clear single-flight | Same |
| Error | Retry clears flight + restarts Uppy upload | Same |
| Success | `setUploadComplete`, `sermonId` | CDN URL / `coverUploadStatus: uploaded` |

Wizard chrome unchanged ([feat-0006 studio flow](../../../api/feature/feat-0006/PRODUCT.md), [feat-0032 cover](../feat-0032/PRODUCT.md)).

---

## Post-upload wizard (unchanged contracts)

After `complete-audio` returns `sermonId`, the studio wizard uses **existing** steps — no new polling logic in feat-0037:

| Step | Spec | Behavior |
| ---- | ---- | -------- |
| Processing poll | [web feat-0018 UPLOAD_STATUS_POLLING_SPEC](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) | Poll `uploadStatus` until `completed` or `failed` |
| ETA / progress copy | [feat-0029](../feat-0029/PRODUCT.md) | Optional ETA surface on Progress step |
| Cancel processing | [feat-0011](../../../api/feature/feat-0011/PRODUCT.md) | `POST /sermon/cancel-processing/:id` — does not abort S3 upload |

feat-0037 only replaces **how bytes reach S3**; downstream API jobs and web polling stay on feat-0006 / feat-0018 polling.

---

## Call sites (P0)

| Surface | Component / hook | Service |
| ------- | ---------------- | ------- |
| Studio audio | `useStudioSermonAudioUpload`, `UploadProgressStep` | `sermon-upload.service.ts` |
| Sermon cover | `SermonEditPage` Details step | `sermon-cover-upload.service.ts` |
| KYC documents | `useDocumentVerification` | `storage-upload.service.ts` |
| Profile avatar / banner | Profile settings components | `storage-upload.service.ts` |

---

## Success criteria

- [ ] 50 MB MP3: browser **PUTs to S3** (not API); one `complete-audio`; processing poll works
- [ ] Throttle network → resume without full re-upload (or clear error if file changed)
- [ ] Cancel mid-upload → abort session; retry works
- [ ] ≤6 MB audio with `forceMultipart` test flag: legacy `start-upload` only
- [ ] `pnpm --filter @troott/web test` passes
- [ ] No `tus-js-client`, no Companion URL in env

---

## Related specs

| Spec | Relationship |
| ---- | ------------ |
| [feat-0018 API](../../../api/feature/feat-0018/PRODUCT.md) | S3 signing + complete; [TASKS](../../../api/feature/feat-0018/TASKS.md) |
| [feat-0018 polling](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) | Post-upload status poll |
| [feat-0006](../../../api/feature/feat-0006/PRODUCT.md) | Audio pipeline after complete |
| [feat-0008](../feat-0008/PRODUCT.md) | Single-flight |
| [feat-0011](../../../api/feature/feat-0011/PRODUCT.md) | Cancel processing |
| [feat-0029](../feat-0029/PRODUCT.md) | Upload ETA |
| [feat-0032](../feat-0032/PRODUCT.md) | Cover |
| [feat-0033](../feat-0033/PRODUCT.md) | Profile |
| [TASKS.md](./TASKS.md) | P0 PR order |
