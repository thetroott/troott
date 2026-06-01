# Audio pipeline: upload through CDN playback

End-to-end flow for sermon audio: multipart upload, S3 ingest, Bull workers (metadata + HLS), derivative uploads, and how clients stream via CDN.

## 1. Client upload request

- **Endpoint:** `POST /api/v1/sermon/start-upload` with `multipart/form-data`.

**Middleware order** ([`sermon.router.ts`](../src/routes/sermon.router.ts)):

1. **Protect** – JWT; sets `req.user`.
2. **sermonUploadRateLimiter** – per-user hourly upload cap.
3. **requireMinisterProfile** – user must have a Minister profile.
4. **sermonAudioUploadSizeLimit** – rejects oversized `Content-Length` when present.
5. **uploadHandler** – busboy parses multipart; tees bytes into `stream` (upload body) and `metadataStream` (same bytes for probing).
6. **uploadSermon** controller.

**Controller** ([`sermon.controller.ts`](../src/controllers/core/sermon.controller.ts)): validates MIME against `mediaConfig.sermonAudioMimeAllowlist`, sets `file.uploadedBy` from the authenticated user, calls `handleUploadSermon(file)`.

## 2. Streaming ingest to S3 (original file)

**Service:** `handleUploadSermon` in [`sermon.service.ts`](../src/services/core/sermon.service.ts).

- Validates MIME and optional size (`SERMON_AUDIO_MAX_BYTES` / [`media.config.ts`](../src/configs/media.config.ts)).
- Builds `s3Key` = `{audio-folder}/{uploadId}` (e.g. `audio/<uploadId>`).
- Uses `@aws-sdk/lib-storage` `Upload` with `Body: stream` so the API does not buffer the whole file in RAM.
- Writes to **`troott-originals`** (env: `AWS_ORIGINALS_BUCKET`; falls back to `AWS_BUCKET_NAME` in dev).
- On success: creates a `Sermon` with:
  - **`item`** (`SermonSource`): `item` (S3 URL), `itemId` (= uploadId), `size`, `mimetype`, `uploadStatus` (`uploaded`), timestamps
  - **`status`**: `MediaStatus.DRAFT`
  - **`minister`**: array of minister/creator owner refs

## 3. Asynchronous jobs (Bull + Redis)

After S3 upload completes, two jobs are enqueued:

| Job       | Queue (`JobChannel`) | Bull job name       | Stable job id           | Payload                                              |
| --------- | -------------------- | ------------------- | ----------------------- | ---------------------------------------------------- |
| Metadata  | `audio:metadata`     | `audio-metadata`    | `audio-meta-{uploadId}` | `metadataStream`, `mimeType`, `uploadId`, `sermonId` |
| HLS pack  | `audio:processing`   | `audio-processing`  | `hls-package-{uploadId}` | `uploadId`, `sourceS3Key`, `sermonId`              |

- Metadata uses the tee’d **metadata stream** from busboy.
- HLS does **not** reuse the upload stream; it **reads the object from S3** by key after upload completes.

**Workers** ([`worker.ts`](../src/tasks/workers/worker.ts)): metadata worker + HLS packaging worker both run against Redis-backed Bull queues.

## 4. Metadata worker

**Job:** [`audio-metadata.job.ts`](../src/tasks/jobs/audio-metadata.job.ts).

- Runs `music-metadata` `parseStream` on `metadataStream`.
- Finds sermon by `_id` (`sermonId`) or `{ 'item.itemId': uploadId }`.
- Sets root **`duration`**, **`bitrate`**, **`mimeType`**, **`item.duration`**, **`item.uploadStatus`** → `extracting`, **`status`** → `draft`.

## 5. HLS worker (transcode + derivatives to S3)

**Job:** [`audio-processing.job.ts`](../src/tasks/jobs/audio-processing.job.ts).

1. Sets **`item.uploadStatus`** → `processing`, **`status`** → `pending` (optional while packaging).
2. Reads the original from **`troott-originals`** via `storageService.getObjectStream(sourceS3Key, 'originals')` and writes a temp ingest file (`HLS_WORK_DIR` or OS tmp).
3. Optional: if `AUDIO_LOUDNORM_BEFORE_HLS=true`, runs loudnorm to WAV, then feeds that into packaging.
4. `ProcessHLS`: per-rendition AAC + HLS segments under a temp directory.
5. Uploads segments and playlists to **`troott-playback`** via `putStreamAtKey` at `{uploadId}/hls/{rendition}/…` (no `audio/` prefix).
6. Builds multivariant **`master.m3u8`** at `{uploadId}/hls/master.m3u8` on the playback bucket.
7. Sets **`manifestUrl`** and **`playbackUrl`** (CDN URLs via `urlForMediaKey`), **`protocol`** → `hls`, **`item.uploadStatus`** → `completed`, **`status`** → `draft`.
8. On failure: **`item.uploadStatus`** → `failed` (errors logged; no legacy `processingError` field on the document).

## 6. Client playback

Web and mobile resolve audio URLs in this order:

1. `playbackUrl`
2. `manifestUrl`
3. `item.item` (raw ingest URL before HLS is ready)

## Related files

| File | Role |
| ---- | ---- |
| [`s3-buckets.config.ts`](../src/configs/s3-buckets.config.ts) | `troott-originals` / `troott-playback` / `troott-storage` routing |
| [`sermon.model.ts`](../src/models/core/sermon.model.ts) | Mongoose schema (`item`, `image`, `MediaStatus`) |
| [`sermon.interface.ts`](../src/interfaces/core/sermon.interface.ts) | `ISermonDoc`, `SermonSource`, enums |
| [`sermon.mapper.ts`](../src/mappers/sermon.mapper.ts) | API response mapping |
| [`audio-metadata.job.ts`](../src/tasks/jobs/audio-metadata.job.ts) | Metadata worker |
| [`audio-processing.job.ts`](../src/tasks/jobs/audio-processing.job.ts) | HLS worker |
