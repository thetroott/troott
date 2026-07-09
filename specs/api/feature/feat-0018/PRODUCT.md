# feat-0018: Resumable uploads — direct to S3 (all surfaces)

> **ID disambiguation:** This is the **API** spec for S3 multipart + Uppy signing (`specs/api/feature/feat-0018/`).  
> Web **upload polling** is a different feature: [web feat-0018 UPLOAD_STATUS_POLLING_SPEC](../../web/feature/feat-0018/UPLOAD_STATUS_POLLING_SPEC.md).  
> Web **Uppy client** is [feat-0037](../../web/feature/feat-0037/PRODUCT.md).  
> Implementation tasks: [TASKS.md](./TASKS.md).

## Summary

Troott accepts user files through **single-request multipart** HTTP endpoints today (`POST /sermon/start-upload`, `POST /storage/upload`, etc.). That breaks down for **sermon audio** (often 20–500 MB), large KYC PDFs, and batch imports from Drive when proxies time out or the network drops.

This feature adds **S3 multipart uploads with presigned URLs**: the **browser uploads bytes directly to S3**; the **Troott API only orchestrates** (create session, sign parts, complete, enqueue processing). The web client uses **[Uppy](https://uppy.io)** with **`@uppy/aws-s3`** and custom signing callbacks to the Troott API — **not TUS**, **not Uppy Companion** as a separate service.

**Primary user pain:** ministers losing progress on **sermon audio** and re-uploading 100+ MB files ([feat-0006](../feat-0006/PRODUCT.md)).

**Web counterpart:** [feat-0037 PRODUCT](../../web/feature/feat-0037/PRODUCT.md)

---

## Architecture (data plane)

```text
Browser (Uppy @uppy/aws-s3)
    |  JWT on API calls only (small JSON)
    v
Troott API  — create multipart, sign-part, list-parts, complete, abort
    |  AWS SDK (no file bytes)
    v
S3  troott-originals (audio) / troott-storage (images, documents)
    |
    v  complete-audio only
Bull  audio:metadata + audio:processing (unchanged feat-0006)
```

**Why direct S3 (not API proxy):** lower API bandwidth cost, better resume at scale, no double network hop. API still owns auth, key naming, sermon row creation, and job enqueue on **complete**.

---

## Upload inventory (full matrix)

P0 implements **S3 multipart + Uppy** for all rows. Legacy `POST` multipart via API remains for files **≤ 6 MB**.

| # | Upload | Legacy endpoint | S3 bucket | Final key | API route group |
| - | ------ | --------------- | --------- | --------- | --------------- |
| 1 | **Sermon audio** | `POST /sermon/start-upload` | `troott-originals` | `audio/{uploadId}` | `/api/v1/sermon/s3/multipart/*` + `complete-audio` |
| 2 | **Sermon cover** | `POST /sermon/image-upload` | `troott-storage` | `images/{uploadId}` | `/api/v1/storage/s3/multipart/*` + `complete-cover` |
| 3 | **Storage image** | `POST /storage/upload` | `troott-storage` | `images/{uploadId}` | `/api/v1/storage/s3/multipart/*` + `complete` |
| 4 | **Storage document** | `POST /storage/upload-document` | `troott-storage` | `documents/{uploadId}` | `/api/v1/storage/s3/multipart/*` + `complete` |

Each **complete** endpoint returns the **same response envelope** as its legacy multipart counterpart.

---

## When to use S3 multipart (Uppy) vs legacy multipart

| Surface | S3 direct (Uppy) | Legacy API multipart |
| ------- | ---------------- | -------------------- |
| **Sermon audio (studio)** | **Always** (default) — resume + cost | `file.size ≤ 6_291_456` only (test clips) |
| Sermon cover | `file.size > 6_291_456` | `file.size ≤ 6_291_456` |
| Storage image / document | `file.size > 6_291_456` | `file.size ≤ 6_291_456` |
| **Drive batch import** | Uppy queue, **1–2 concurrent** S3 uploads per user | — |

**6 MB** = `6_291_456` bytes. Web enforces the branch ([feat-0037](../../web/feature/feat-0037/PRODUCT.md)).

---

## Problem

| Today | Impact |
| ----- | ------ |
| Sermon audio: one long `multipart/form-data` POST through API | Timeouts; no resume; **expensive API bandwidth** |
| Batch Drive imports (future) | Cannot queue resumable uploads efficiently |
| Axios `onUploadProgress` only | No multipart resume across refresh |
| feat-0008 fixed duplicate `start-upload` storms | Still one fragile HTTP body per attempt |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-S3U01 | Minister | **Sermon audio** uploaded direct to S3 with resume | Disconnect does not restart from byte 0 |
| UC-S3U02 | Minister | Progress from Uppy during a 45-minute MP3 upload | Progress step shows real bytes / total |
| UC-S3U03 | Minister | After `complete-audio`, same draft sermon + `uploadRef` as `start-upload` | Metadata + HLS jobs run unchanged ([feat-0006](../feat-0006/PRODUCT.md)) |
| UC-S3U04 | Minister | Large cover images (>6 MB) to resume | [feat-0032 web](../../web/feature/feat-0032/PRODUCT.md) |
| UC-S3U05 | Minister | KYC PDFs direct to S3 when large | Documents in `troott-storage` |
| UC-S3U06 | Minister | Batch uploads from Drive (queued) | 1–2 concurrent uploads, each resumable |
| UC-S3U07 | Operator | Aborted / stale multipart uploads aborted in S3 | No orphan parts billing unbounded |
| UC-S3U08 | Engineer | Troott API signs URLs; Uppy uploads; no Companion service | Simpler deploy on Coolify |

---

## Scope

### In scope (P0)

- S3 multipart orchestration on Troott API (presigned `UploadPart`, `CompleteMultipartUpload`)
- **Sermon audio:** `/sermon/s3/multipart/*` → `troott-originals` → `complete-audio` → sermon + Bull jobs
- **Storage:** `/storage/s3/multipart/*` → `troott-storage` → `complete` → `ImageDTO`
- **Cover:** storage multipart → `complete-cover` with `sermonId`
- JWT on all API signing routes; minister gate on sermon audio
- S3 bucket CORS for studio origin (`app.troott.com`, local dev)
- Registry of in-flight uploads (`uploadId`, `s3Key`, `s3UploadId`, `ownerId`, `purpose`)
- Abort + list-parts for Uppy resume
- Cleanup job for expired incomplete multipart uploads

### Out of scope (P0)

- **Uppy Companion** as a separate deployed service
- **TUS** protocol (superseded by this spec)
- Mobile Expo (future; same API contract)
- `packages/upload` shared library
- Standalone util/service layers for multipart session registry (logic lives in controllers + `sermon.service`)

### P1

- `@uppy/google-drive` with Google Picker + add files to Uppy (Drive OAuth)
- Server-side Drive folder import (API streams Drive → S3)

---

## Cross-app contract

API and web share **HTTP only**. Uppy `@uppy/aws-s3` uses **custom signing functions** that call Troott API — see [TECH.md](./TECH.md) and [feat-0037 TECH](../../web/feature/feat-0037/TECH.md).

| Surface | Uppy plugin config | Complete endpoint |
| ------- | ------------------ | ----------------- |
| Sermon audio | `sermonS3Signing` → `/sermon/s3/multipart/*` | `POST /sermon/s3/multipart/complete-audio` |
| Sermon cover | `storageS3Signing` | `POST /sermon/s3/multipart/complete-cover` |
| Storage image/doc | `storageS3Signing` | `POST /storage/s3/multipart/complete` |

---

## Success criteria

- [ ] **50 MB MP3** via Uppy → S3 `troott-originals`; `complete-audio` returns `id`, `uploadRef`, `item.uploadStatus: uploaded`; jobs enqueued
- [ ] Network drop mid-upload → Uppy resumes via `listParts` + `signPart` (no full re-upload)
- [ ] **10 MB cover** → S3 + `complete-cover`; CDN `imageUrl` ([feat-0008](../feat-0008/PRODUCT.md))
- [ ] **2 MB** files still use legacy API multipart (no S3 PUT from browser)
- [ ] S3 CORS allows studio origin; presigned URLs scoped to exact `key` + `uploadId`
- [ ] `complete-audio` idempotent — retry does not duplicate sermon or jobs
- [ ] Unit tests per complete endpoint + signing auth failures

---

## References

- [Uppy AWS S3](https://uppy.io/docs/aws-s3/)
- [Uppy Core](https://uppy.io/docs/uppy/)
- [AWS S3 multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)
- [Supabase resumable uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads) (pattern reference — they use TUS; we use S3 MPU + Uppy)

---

## Post-upload wizard (unchanged)

After `complete-audio`, the web upload modal behavior is **unchanged**:

| Concern | Spec |
| ------- | ---- |
| Poll `item.uploadStatus` until terminal | [web feat-0018 UPLOAD_STATUS_POLLING_SPEC](../../web/feature/feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) |
| Processing ETA footer | [web feat-0029 PROCESSING_ETA_SPEC](../../web/feature/feat-0029/PROCESSING_ETA_SPEC.md) |
| `GET /sermon/:id` 404 during poll | [feat-0011](../feat-0011/PRODUCT.md) |
| Cancel processing after upload | `POST /sermon/cancel-processing/:id` ([TECH §19](./TECH.md)) |

---

## Related specs

| Spec | Relationship |
| ---- | ------------ |
| [feat-0006](../feat-0006/PRODUCT.md) | Processing after `complete-audio`; TECH §1b S3 ingest |
| [feat-0008](../feat-0008/PRODUCT.md) | CDN URLs on storage complete |
| [feat-0014](../feat-0014/PRODUCT.md) | Cover contract + `complete-cover` |
| [feat-0008 web](../../web/feature/feat-0008/PRODUCT.md) | Single-flight per file (web) |
| [web feat-0037](../../web/feature/feat-0037/PRODUCT.md) | Uppy client |
| [TASKS.md](./TASKS.md) | P0 implementation order |
