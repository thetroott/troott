# feat-0006: Tech Spec — Sermon audio upload through processing

## Context

See [`PRODUCT.md`](./PRODUCT.md). Primary implementation in **`apps/api`**.

**Resumable ingest (direct S3):** [API feat-0018](../feat-0018/PRODUCT.md) — browser uploads via Uppy; API `complete-audio` triggers the same pipeline as §1 below. See **§1b**.

---

## 1. Upload endpoint (legacy API multipart)

### Request

| Property | Value |
| -------- | ----- |
| **Method / path** | `POST /api/v1/sermon/start-upload` |
| **Auth** | Bearer JWT (`Protect`) |
| **Content-Type** | `multipart/form-data` |
| **File field** | First file in multipart body (any field name accepted by busboy) |
| **Actor** | User with **Minister or Creator** profile (`requireMinisterProfile`) |

Allowed MIME types (default allowlist in [`media.config.ts`](../../../../apps/api/src/configs/media.config.ts)):

`audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/x-wav`, `audio/aac`, `audio/x-m4a`, `audio/mp4`, `audio/x-caf`

Override via `SERMON_AUDIO_MIME_ALLOWLIST` (comma-separated).

### Middleware order

[`sermon.router.ts`](../../../../apps/api/src/routes/sermon.router.ts):

1. **Protect** — JWT; sets `req.user`
2. **sermonUploadRateLimiter** — per-user cap (default 40/hour; `SERMON_UPLOAD_RATE_LIMIT_PER_HOUR`)
3. **requireMinisterProfile** — minister or creator studio profile
4. **sermonAudioUploadSizeLimit** — rejects `Content-Length` > `SERMON_AUDIO_MAX_BYTES` when header present
5. **uploadHandler** — busboy; tees bytes into `stream` + `metadataStream`; assigns `uploadId`
6. **uploadSermon** controller

### Handler behavior

[`handleUploadSermon`](../../../../apps/api/src/services/core/sermon.service.ts):

1. Validate MIME and optional declared size against `mediaConfig`
2. Build `s3Key = {folder}/{uploadId}` (folder from MIME, typically `audio`)
3. Stream to **`troott-originals`** via `@aws-sdk/lib-storage` `Upload` (no full-file RAM buffer)
4. Resolve owner: `Minister` by `user`, else `Creator` by `user`
5. Create draft `Sermon` with `item` (`SermonSource`), `status = draft`, `item.uploadStatus = uploaded`
6. Enqueue metadata + HLS jobs (§4)
7. Return created sermon document

On failure: destroy streams, delete partial S3 object (best effort), return error.

### Success response

HTTP **200** with standard API envelope; `data` is mapped sermon DTO ([`sermon.mapper.ts`](../../../../apps/api/src/mappers/sermon.mapper.ts)).

| Field | Typical value immediately after upload |
| ----- | -------------------------------------- |
| `id` | Mongo `_id` |
| `uploadRef` | Same as `item.itemId` (= uploadId) |
| `status` | `draft` |
| `item.item` | S3 URL of raw ingest |
| `item.itemId` | Upload session id |
| `item.uploadStatus` | `uploaded` |
| `playbackUrl` | `""` (not set until HLS completes) |
| `manifestUrl` | `""` |
| `duration` | `0` until metadata job runs |

### Error responses

| Code | Condition |
| ---- | --------- |
| **400** | No file, unsupported MIME, missing upload fields |
| **401** | Missing / invalid JWT |
| **403** | No minister or creator profile |
| **413** | Body exceeds `SERMON_AUDIO_MAX_BYTES` |
| **429** | Rate limit exceeded |
| **500** | S3 failure, DB failure, unexpected error |

---

## 1b. Upload endpoint (direct S3 multipart — preferred for studio)

Canonical spec: [feat-0018 TECH](../feat-0018/TECH.md). Web client: [feat-0037](../../web/feature/feat-0037/PRODUCT.md).

| Property | Value |
| -------- | ----- |
| **Ingest** | Browser → S3 `troott-originals` via presigned multipart (Uppy) |
| **Orchestration** | `POST /api/v1/sermon/s3/multipart/*` + `POST …/complete-audio` |
| **When** | Studio sermon audio default; legacy §1 for `file.size ≤ 6 MB` only |
| **Auth / actor** | Same as §1 (`Protect`, `requireMinisterProfile`, rate limit on create) |

**After `complete-audio`:** `sermonService.completeS3AudioUpload` must produce the **same** sermon document fields and Bull payloads as [`handleUploadSermon`](../../../../apps/api/src/services/core/sermon.service.ts) (see feat-0018 TECH §16). Workers in §4 below are unchanged — they only need `sourceS3Key` on `troott-originals`.

**Web polling after upload:** [web feat-0018 UPLOAD_STATUS_POLLING_SPEC](../../web/feature/feat-0018/UPLOAD_STATUS_POLLING_SPEC.md).

**Implementation tasks:** [feat-0018 TASKS](../feat-0018/TASKS.md).

---

## 2. S3 storage

Bucket routing: [`s3-buckets.config.ts`](../../../../apps/api/src/configs/s3-buckets.config.ts). When split env vars are unset, all roles fall back to `AWS_BUCKET_NAME` (dev).

| Role | Env | Bucket (prod) | Key pattern | Content |
| ---- | --- | ------------- | ----------- | ------- |
| **originals** | `AWS_ORIGINALS_BUCKET` | `troott-originals` | `audio/{uploadId}` | Minister source file (unchanged) |
| **playback** | `AWS_PLAYBACK_BUCKET` | `troott-playback` | `{uploadId}/hls/{rendition}/…` | HLS segments + variant playlists |
| **playback** | | | `{uploadId}/hls/master.m3u8` | Multivariant master |
| **storage** | `AWS_STORAGE_BUCKET` | `troott-storage` | `images/*`, `documents/*`, … | Not used by sermon audio pipeline |

HLS keys on the playback bucket **must not** use the `audio/` prefix (legacy bug fixed in feat-0005).

Public URLs for playback objects use `MEDIA_CDN_BASE_URL` when set ([`urlForMediaKey`](../../../../apps/api/src/configs/media.config.ts)); otherwise direct S3 HTTPS.

---

## 3. Sermon document and status

### Key fields

| Field | Set by | Purpose |
| ----- | ------ | ------- |
| `item` (`SermonSource`) | Upload | Raw ingest URL, size, mime, `itemId`, `uploadStatus` |
| `duration`, `bitrate`, `mimeType` | Metadata job | Catalog + UI |
| `manifestUrl`, `playbackUrl`, `protocol` | HLS job | Streaming (`protocol = hls`) |
| `status` (`MediaStatus`) | Upload / jobs | Publication lifecycle (`draft` through upload pipeline) |

### `item.uploadStatus` state machine

Enum: [`UploadStatus`](../../../../apps/api/src/interfaces/core/sermon.interface.ts)

```text
idle → uploading → uploaded → processing ──→ completed
                          ↘ extracting ↗      ↓
                                            failed
```

| Order | Event | `item.uploadStatus` | Notes |
| ----- | ----- | ------------------- | ----- |
| 1 | S3 upload + DB create | `uploaded` | API response to client |
| 2 | Metadata job starts | `extracting` | Sets `duration`, `bitrate` |
| 3 | HLS job starts | `processing` | Also sets root `status` → `pending` briefly |
| 4 | HLS success | `completed` | Sets `playbackUrl`, `manifestUrl` |
| 5 | HLS failure | `failed` | Deletes partial HLS prefix on playback bucket |

---

## 4. Background jobs

Workers run in the API process ([`worker.ts`](../../../../apps/api/src/tasks/workers/worker.ts)) against Redis-backed Bull queues.

### Job summary

| Queue | Bull name | Stable job id | Attempts | Delay | Payload |
| ----- | --------- | ------------- | -------- | ----- | ------- |
| `audio:metadata` | `audio-metadata` | `audio-meta-{uploadId}` | 5 | 0 | `sourceS3Key`, `mimeType`, `uploadId`, `sermonId` |
| `audio:processing` | `audio-processing` | `hls-package-{uploadId}` | 3 | 2s | `uploadId`, `sourceS3Key`, `sermonId`, optional `renditions`, `segmentDuration` |

HLS does **not** reuse the upload stream; it reads **`sourceS3Key`** from originals after upload completes.

Enqueue site: [`sermon.service.ts`](../../../../apps/api/src/services/core/sermon.service.ts) (`handleUploadSermon`).

### 4.1 Metadata worker

File: [`audio-metadata.job.ts`](../../../../apps/api/src/tasks/jobs/audio-metadata.job.ts)

1. `music-metadata` `parseStream` on S3 object stream from **`getObjectStream(sourceS3Key, 'originals')`**
2. Find sermon by `_id` (`sermonId`) or `{ 'item.itemId': uploadId }`
3. Update `duration`, `bitrate`, `mimeType`, `item.duration`, `item.uploadStatus → extracting`, `status → draft`

### 4.2 HLS processing worker

File: [`audio-processing.job.ts`](../../../../apps/api/src/tasks/jobs/audio-processing.job.ts)

**Stream-native pipeline** ([`feat-0007`](../feat-0007/PRODUCT.md)): no full ingest or normalized WAV on disk; loudnorm → **AAC** → HLS in one FFmpeg pass per rendition.

1. Set `item.uploadStatus → processing`, `status → pending`
2. For **each rendition** (sequential):
   - Open **`getObjectStream(sourceS3Key, 'originals')`**
   - FFmpeg stdin pipe with inline **`sermonAudioLoudnormFilter`** + AAC + HLS mux (segment scratch only)
   - Stream-upload each segment/playlist to **`troott-playback`**, delete local segment after upload
   - `job.progress()` for Bull lock renewal
3. Build **`master.m3u8`** in memory → stream upload
4. Set `manifestUrl`, `playbackUrl`, `protocol → hls`, `item.uploadStatus → completed`
5. On failure: delete `{uploadId}/hls/` prefix on playback bucket; set `item.uploadStatus → failed`

Default renditions and segment duration unchanged (see prior table). Queue uses **3h `lockDuration`** ([`feat-0007/TECH.md`](../feat-0007/TECH.md)).

---

## 5. Failure, cleanup, and retry

| Failure | System behavior | Client action |
| ------- | --------------- | ------------- |
| Upload 413/400 | No sermon or partial cleanup | Fix file; retry upload |
| S3 upload error | Streams destroyed; key deleted if created | Retry upload |
| Metadata job error | Bull retries (5×); sermon may lack duration | Wait or poll; HLS may still complete |
| HLS job error | Partial HLS deleted; `uploadStatus = failed` | Re-upload audio or ops reprocess (future) |
| Disk full on worker | Job fails; same as HLS error | Ops: increase `HLS_WORK_DIR` volume |

Re-uploading the same sermon typically requires a **new** `start-upload` (new `uploadId`) unless a dedicated reprocess endpoint is added (feat-0005 phase 3).

---

## 6. Configuration

| Variable | Default (intent) | Purpose |
| -------- | ---------------- | ------- |
| `AWS_ORIGINALS_BUCKET` | `troott-originals` | Source audio |
| `AWS_PLAYBACK_BUCKET` | `troott-playback` | HLS output |
| `SERMON_AUDIO_MAX_BYTES` | `536870912` (512 MiB) | Max upload size |
| `SERMON_AUDIO_MIME_ALLOWLIST` | see §1 | Allowed MIME types |
| `SERMON_UPLOAD_RATE_LIMIT_PER_HOUR` | `40` | Upload rate limit |
| `MEDIA_CDN_BASE_URL` | — | CDN base for `playbackUrl` |
| `AUDIO_LOUDNORM_FILTER` | `loudnorm=I=-16:TP=-1.5:LRA=11` | Required pre-HLS filter (always on) |
| `AUDIO_HLS_WORKER_CONCURRENCY` | `1` prod / `2` dev | Parallel HLS jobs per process |
| `HLS_WORK_DIR` | OS tmpdir | FFmpeg scratch (use large volume in prod) |
| `GRACEFUL_SHUTDOWN_MS` | `120000` | HTTP drain on SIGTERM |

Bucket rollout and Docker: [`feat-0005/TECH.md`](../feat-0005/TECH.md).

---

## 7. Source files

| File | Role |
| ---- | ---- |
| [`sermon.router.ts`](../../../../apps/api/src/routes/sermon.router.ts) | Route + middleware chain |
| [`sermon.controller.ts`](../../../../apps/api/src/controllers/core/sermon.controller.ts) | `uploadSermon` |
| [`sermon.service.ts`](../../../../apps/api/src/services/core/sermon.service.ts) | S3 upload + job enqueue |
| [`upload.mdw.ts`](../../../../apps/api/src/middlewares/upload.mdw.ts) | Busboy tee streams |
| [`sermon-upload.security.mdw.ts`](../../../../apps/api/src/middlewares/sermon-upload.security.mdw.ts) | Size + rate limits |
| [`require-minister.mdw.ts`](../../../../apps/api/src/middlewares/require-minister.mdw.ts) | Minister or creator gate |
| [`media.config.ts`](../../../../apps/api/src/configs/media.config.ts) | Limits, loudnorm, CDN |
| [`s3-buckets.config.ts`](../../../../apps/api/src/configs/s3-buckets.config.ts) | Bucket roles |
| [`storage.service.ts`](../../../../apps/api/src/services/storage.service.ts) | S3 get/put by role |
| [`audio-metadata.job.ts`](../../../../apps/api/src/tasks/jobs/audio-metadata.job.ts) | Metadata worker |
| [`audio-processing.job.ts`](../../../../apps/api/src/tasks/jobs/audio-processing.job.ts) | HLS + loudnorm worker |
| [`audio.service.ts`](../../../../apps/api/src/services/core/audio.service.ts) | FFmpeg HLS |
| [`sermon.model.ts`](../../../../apps/api/src/models/core/sermon.model.ts) | Schema |
| [`sermon.interface.ts`](../../../../apps/api/src/interfaces/core/sermon.interface.ts) | Enums + DTOs |

---

## 8. Related specs

| Document | Relationship |
| -------- | ------------ |
| [`feat-0005/PRODUCT.md`](../feat-0005/PRODUCT.md) | Three-bucket rollout, Docker, graceful shutdown |
| [`feat-0005/TECH.md`](../feat-0005/TECH.md) | Env vars and infra-oriented file changes |
| [`audio-processing-job-plan.md`](../../audio-processing-job-plan.md) | Bull/ffmpeg design notes and phase 2 roadmap |
| [`media-compute-deployment-plan.md`](../../media-compute-deployment-plan.md) | EC2 sizing, disk, CloudFront |
| [`specs/web/feature/feat-0006/`](../../../web/feature/feat-0006/PRODUCT.md) | Studio CRUD + publish (uses this pipeline) |
| [`specs/web/feature/feat-0018/`](../../../web/feature/feat-0018/PRODUCT.md) | Upload wizard UI |
