# feat-0007: Tech Spec — Stream-native sermon audio processing

## Context

See [`PRODUCT.md`](./PRODUCT.md). Changes are in **`apps/api`** HLS worker, **`audio.service.ts`**, and Bull queue settings.

---

## Architecture

```text
POST /sermon/start-upload
  busboy stream ──► S3 multipart Upload (originals)
       │
       └──► enqueue audio:metadata (sourceS3Key) + audio:processing

audio:processing job:
  optional: S3 stream → loudnorm measure pass (-f null)
  S3 getObjectStream (once) ──pipe──► FFmpeg stdin
       ├─ -af loudnorm (single or linear 2-pass)
       └─ multi -map HLS outputs → seg_NNN.ts (short-lived)
  HlsIncrementalUploader: seg_*.ts ──► putStreamAtKey ──► unlink
  master.m3u8 ──Readable.from(buffer)──► putStreamAtKey
```

---

## 1. Upload (unchanged)

Streaming ingest per [`feat-0006/TECH.md`](../feat-0006/TECH.md) §1 — `@aws-sdk/lib-storage` with `Body: stream`.

---

## 2. `audio.service.ts`

### Loudnorm → AAC (not WAV)

### Rationale

| Approach | 2 hr sermon disk (order of magnitude) | Production fit |
| -------- | ------------------------------------- | ---------------- |
| loudnorm → **WAV file** → HLS | ~1.2 GiB normalized + ingest | Poor — stalls, disk pressure |
| loudnorm → **AAC** → HLS (one pass) | Segment scratch only (~MB per `.ts`) | **Required** |

WAV is acceptable only as a **pipe container** in lab tools; Troott production paths must **not** write `normalized.wav`.

### `processHLSAllRenditionsFromStream`

Encodes **all** HLS ladder runs from one readable source stream in a **single FFmpeg** process.

| Parameter | Type | Notes |
| --------- | ---- | ----- |
| `inputStream` | `Readable` | S3 object body |
| `audioFilter` | `string` | `mediaConfig.sermonAudioLoudnormFilter` or 2-pass linear filter |
| `renditions` | `AudioRenditionDTO[]` | Bitrate / sample rate / channels per variant |
| `packRoot` | `string` | Parent dir; one subdir per rendition |
| `segmentDuration` | `number` | Default `6` |

### `measureLoudnormFilterFromStream`

Pass 1 of optional 2-pass loudnorm: `-f null` output, parse JSON from stderr, return `linearFilter` for pass 2.

**Forbidden in HLS worker:** `-f wav`, `normalized.wav`, ingest spool, or any standalone loudnorm-to-file step before AAC.

### Removed from HLS job path (phase 1–2)

- `runCli` loudnorm → **`normalized.wav`** (WAV on disk)
- Full S3 download to `ingest` before encode
- `ProcessHLS({ inputFilePath: normPath })` from the HLS worker
- Two-pass FFmpeg: normalize-to-WAV then encode

---

## 3. `audio-processing.job.ts`

### Removed steps

- `pipeline(s3Stream, createWriteStream(ingestPath))`
- `runCli` loudnorm to **`normalized.wav`** (replaced by inline AAC)
- `ProcessHLS({ inputFilePath: normPath })`

### New flow

1. Optional 2-pass loudnorm measure from S3 (`AUDIO_LOUDNORM_TWO_PASS`).
2. `mkdtemp` work dir (segment scratch only).
4. Start `HlsIncrementalUploader` polling segment dirs.
5. **One** `getObjectStream` → `processHLSAllRenditionsFromStream`.
6. `flushRemaining()` — playlists + any missed segments.
7. Master playlist in memory → `putStreamAtKey`.
8. Update sermon document; `finally`: `fs.rm(workDir)`.

### Progress / logging

Normative log lines (label `audio-hls-processor`):

| Message prefix | When |
| -------------- | ---- |
| `HLS rendition encode uploadId=… name=… ms=…` | After FFmpeg completes for one rendition |
| `HLS rendition upload uploadId=… name=… ms=…` | After segment/playlist S3 uploads for that rendition |
| `HLS packaged uploadId=… master=… totalMs=…` | Job success |

### Partial failure & retry (current code)

| Event | Behavior |
| ----- | -------- |
| Any rendition throws | `deleteObjectsByPrefix(`${uploadId}/hls/`, playback)`; `uploadStatus = failed` |
| Bull retry (`attempts: 3`) | Full job restarts from rendition 1; **no** resume from N |
| Metadata job fails | Does not set `failed`; HLS may still complete ([feat-0006](../feat-0006/TECH.md)) |

Recommended follow-up: metadata from S3 key; optional per-rendition idempotency — see [PRODUCT § Omissions](./PRODUCT.md#omissions--deferred).

---

## 4. Bull queue: long jobs

File: [`queue.ts`](../../../../apps/api/src/queues/queue.ts)

For queue name `audio:processing` (`JobChannel.processAudio`):

```ts
settings: {
  lockDuration: 3 * 60 * 60 * 1000,  // 3 hours
  stalledInterval: 60 * 1000,
  maxStalledCount: 2,
}
```

Default Bull `lockDuration` (30s) causes **“job stalled more than allowable limit”** on long transcodes.

Job handler must call **`await job.progress(n)`** at least once per rendition.

---

## 5. Email template path fix

File: [`email.service.ts`](../../../../apps/api/src/services/email.service.ts)

**Bug:** `BASE_FOLDER = ${appRootPath.path}/apps/api/src` doubles `apps/api` when the process cwd is already `apps/api`.

**Fix:**

```ts
const BASE_FOLDER = path.join(appRootPath.path, 'src');
const templatePath = path.join(
  BASE_FOLDER,
  'views',
  'emails',
  templateFolder,
  `${data.template}.pug`,
);
```

---

## 6. Configuration

Unchanged from feat-0006 except **`HLS_WORK_DIR`** holds **HLS segment scratch only** (not full ingest or WAV).

| Variable | Notes |
| -------- | ----- |
| `AUDIO_LOUDNORM_FILTER` | Passed as `-af` in stream rendition encoder |
| `AUDIO_HLS_WORKER_CONCURRENCY` | Keep `1` in prod (one long job per CPU) |

---

## 7. Source files

| File | Change |
| ---- | ------ |
| [`audio.service.ts`](../../../../apps/api/src/services/core/audio.service.ts) | `processHLSAllRenditionsFromStream`, `measureLoudnormFilterFromStream` |
| [`hls-segment-uploader.util.ts`](../../../../apps/api/src/utils/hls-segment-uploader.util.ts) | Incremental segment upload (P2b) |
| [`audio-processing.job.ts`](../../../../apps/api/src/tasks/jobs/audio-processing.job.ts) | Single-read multi-rendition pipeline |
| [`queue.ts`](../../../../apps/api/src/queues/queue.ts) | Long `lockDuration` for `audio:processing` |
| [`media.config.ts`](../../../../apps/api/src/configs/media.config.ts) | `AUDIO_LOUDNORM_TWO_PASS`, loudnorm filter |
| [`email.service.ts`](../../../../apps/api/src/services/email.service.ts) | Template path fix |

---

## 8. Optimization (implementation notes)

Product priorities and metrics: [`PRODUCT.md`](./PRODUCT.md) § Optimization roadmap.

### P1 — Single S3 read (no spool)

**Shipped:** one `getObjectStream` per encode pass; optional extra read only for 2-pass loudnorm measure. **No** ingest spool, WAV, or normalized intermediate files on disk.

**Files:** [`audio-processing.job.ts`](../../../../apps/api/src/tasks/jobs/audio-processing.job.ts), [`audio.service.ts`](../../../../apps/api/src/services/core/audio.service.ts)

### P2 — Multi-rendition single FFmpeg

**Shipped:** `processHLSAllRenditionsFromStream` — one `-i pipe:0`, shared `-af loudnorm`, multiple `-map 0:a` HLS outputs.

### P2 — Incremental segment upload

**Shipped:** [`HlsIncrementalUploader`](../../../../apps/api/src/utils/hls-segment-uploader.util.ts) polls `{packRoot}/{rendition}/seg_*.ts`, uploads to playback, unlinks. Playlists flushed in `flushRemaining()`.

### P3 — 2-pass loudnorm

**Shipped:** `measureLoudnormFilterFromStream` (pass A: `-f null`, parse JSON from stderr) → `linearFilter` → encode pass B. **Env:** `AUDIO_LOUDNORM_TWO_PASS=true` (default single-pass).

### P3 — External transcoder (deferred)

**Not in API:** AWS MediaConvert / dedicated worker fleet. See [`media-compute-deployment-plan.md`](../../media-compute-deployment-plan.md). HLS packaging uses **`audio.service.ts`** + FFmpeg on the API worker only.

### Observability (add before P1)

Extend existing logs with structured fields:

```text
uploadId, rendition, stage=encode|upload, ms, s3GetBytes (cumulative), workDirBytesPeak
```

Alert when `s3GetBytes > 1.5 × sourceSize × renditionCount` (unexpected re-reads).

---

## 9. Related specs

| Document | Relationship |
| -------- | ------------ |
| [`feat-0006/`](../feat-0006/PRODUCT.md) | Upload contract + status machine |
| [`feat-0005/`](../feat-0005/PRODUCT.md) | Bucket roles |
| [`audio-processing-job-plan.md`](../../audio-processing-job-plan.md) | Phase 2: single-pass multi-rendition FFmpeg (P2) |

---

## Implementation checklist

### In scope (feat-0007 phase 1 — done)

- [x] `processHLSAllRenditionsFromStream` — one S3 read, one FFmpeg, all renditions
- [x] `HlsIncrementalUploader` — segment upload during encode
- [x] Optional 2-pass loudnorm (`AUDIO_LOUDNORM_TWO_PASS`)
- [x] No `ingest` / `normalized.wav` / spool in HLS worker
- [x] Segment stream upload + local unlink
- [x] Master `m3u8` from memory
- [x] `audio:processing` queue `lockDuration` ≥ 3h + `job.progress()` per rendition
- [x] Email template `BASE_FOLDER` path fix (TECH §5)

### Follow-up (feat-0007 phase 2 — done unless noted)

- [x] **Delete** legacy APIs: `ProcessHLS`, `EncodeMultiBitrate`, `runCli`, `NormaliseAudio` + unused DTOs
- [x] Metadata job: read **`sourceS3Key`** from originals instead of Bull stream payload
- [x] Structured HLS metrics (`s3GetBytes`, `workDirBytesPeak`) in logs
- [x] P1–P3 optimization roadmap ([PRODUCT § Optimization roadmap](./PRODUCT.md#optimization-roadmap))

---

## Omissions & known gaps (code)

Inherited from [feat-0006 TECH](../feat-0006/TECH.md) unless noted. Full product table: [PRODUCT § Omissions & deferred](./PRODUCT.md#omissions--deferred).

| Gap | Module / behavior | feat-0007 |
| --- | ----------------- | --------- |
| Metadata stream in Bull | ~~`metadataStream` in job data~~ | **Done** — `sourceS3Key` + S3 read |
| Legacy disk FFmpeg APIs | ~~`ProcessHLS`, etc.~~ | **Removed** from `audio.service.ts` |
| `NormaliseAudio` unused | Removed with legacy APIs | **Done** |
| Partial rendition failure | [`audio-processing.job.ts`](../../../../apps/api/src/tasks/jobs/audio-processing.job.ts) wipes full `hls/` prefix | Documented; resume deferred |
| Full job retry | Bull 3× from rendition 1 | Documented; no checkpoint |
| Metadata ∥ HLS race | Parallel queues after upload | Client: feat-0006; duration may lag |
| Pipe backpressure / seek | S3 → FFmpeg stdin | Mitigated by single-read encode; no spool |
