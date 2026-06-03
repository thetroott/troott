# Audio pipeline: upload through CDN playback

> **Canonical spec:** [`specs/api/feature/feat-0006/PRODUCT.md`](../../../specs/api/feature/feat-0006/PRODUCT.md) + [`TECH.md`](../../../specs/api/feature/feat-0006/TECH.md)
>
> **Stream-native processing:** [`specs/api/feature/feat-0007/`](../../../specs/api/feature/feat-0007/PRODUCT.md) — S3 → FFmpeg pipe → incremental segment upload (no ingest/WAV/spool on disk)

This file is a **short implementation index** aligned with the code in `apps/api`.

## 1. Client upload request

- **Endpoint:** `POST /api/v1/sermon/start-upload` with `multipart/form-data`.

**Middleware order** ([`sermon.router.ts`](../src/routes/sermon.router.ts)):

1. **Protect** – JWT; sets `req.user`.
2. **sermonUploadRateLimiter** – per-user hourly upload cap.
3. **requireMinisterProfile** – user must have a Minister or Creator profile.
4. **sermonAudioUploadSizeLimit** – rejects oversized `Content-Length` when present.
5. **uploadHandler** – busboy parses multipart into a single upload `stream`.
6. **uploadSermon** controller.

## 2. Streaming ingest to S3 (original file)

**Service:** `handleUploadSermon` in [`sermon.service.ts`](../src/services/core/sermon.service.ts).

- Validates MIME and optional size (`SERMON_AUDIO_MAX_BYTES`, `SERMON_AUDIO_MIME_ALLOWLIST` env vars).
- Builds `s3Key` = `{audio-folder}/{uploadId}` (e.g. `audio/<uploadId>`).
- Uses `@aws-sdk/lib-storage` `Upload` with `Body: stream`.
- Writes to **`troott-originals`**.
- Enqueues metadata + HLS with **`sourceS3Key`** (not live streams in Bull).

## 3. Asynchronous jobs (Bull + Redis)

| Job       | Queue | Stable job id           | Payload |
| --------- | ----- | ----------------------- | ------- |
| Metadata  | `audio:metadata` | `audio-meta-{uploadId}` | `sourceS3Key`, `mimeType`, `uploadId`, `sermonId` |
| HLS pack  | `audio:processing` | `hls-package-{uploadId}` | `uploadId`, `sourceS3Key`, `sermonId` |

## 4. Metadata worker

**Job:** [`audio-metadata.job.ts`](../src/tasks/jobs/audio-metadata.job.ts).

- `getObjectStream(sourceS3Key, 'originals')` → `music-metadata` `parseStream`.
- Sets `duration`, `bitrate`, `item.uploadStatus → extracting`.

## 5. HLS worker (stream-native FFmpeg)

**Job:** [`audio-processing.job.ts`](../src/tasks/jobs/audio-processing.job.ts).

1. Optional **2-pass loudnorm** (`AUDIO_LOUDNORM_TWO_PASS=true`): measure pass from S3 → linear filter (no WAV).
2. **One S3 read** → **`processHLSAllRenditionsFromStream`** (loudnorm → AAC → all HLS renditions in one FFmpeg).
3. **`HlsIncrementalUploader`** polls segment dirs, uploads to playback, unlinks each `.ts` as it closes.
4. Master `m3u8` from memory; Bull **`lockDuration` 3h** on `audio:processing`.
5. Logs: **`s3GetBytes`**, **`workDirBytesPeak`**, stage timings.

## 6. Client playback

1. `playbackUrl` → 2. `manifestUrl` → 3. `item.item`

## Related files

| File | Role |
| ---- | ---- |
| [`audio.service.ts`](../src/services/core/audio.service.ts) | `processHLSAllRenditionsFromStream`, `measureLoudnormFilterFromStream` |
| [`hls-segment-uploader.util.ts`](../src/utils/hls-segment-uploader.util.ts) | Incremental segment upload + unlink |
| [`audio-metadata.job.ts`](../src/tasks/jobs/audio-metadata.job.ts) | S3-based metadata |
| [`audio-processing.job.ts`](../src/tasks/jobs/audio-processing.job.ts) | HLS worker |
| Env (`AUDIO_LOUDNORM_*`, `HLS_WORK_DIR`, `AUDIO_HLS_WORKER_CONCURRENCY`) | Loudnorm, worker concurrency, temp dir |
| [`queue.ts`](../src/queues/queue.ts) | Long-running HLS queue settings |
