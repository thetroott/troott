# Upload processing step timings (API)

> Canonical upload + pipeline flow: [`feature/feat-0006/PRODUCT.md`](./feature/feat-0006/PRODUCT.md) + [`TECH.md`](./feature/feat-0006/TECH.md).  
> Stream-native worker details: [`feature/feat-0007/TECH.md`](./feature/feat-0007/TECH.md).

This spec defines how to measure end-to-end timing for a single sermon upload across four stages, and each stage individually.

---

## Goal

For every `uploadId`, produce a complete latency breakdown:

1. **Upload transfer** (web -> API -> originals S3)
2. **Metadata extraction job**
3. **HLS processing job**
4. **Queue wait** before metadata and HLS jobs begin

The output should make bottlenecks obvious (network upload vs queue congestion vs metadata vs transcode).

---

## Correlation key

Use `uploadId` as the primary trace key in all logs.

Examples:

- `file-audio-2026-06-02-08-13-37`
- metadata job id: `audio-meta-{uploadId}`
- hls job id: `hls-package-{uploadId}`

---

## Stage definitions

| Stage | Start | End | Metric |
|------|-------|-----|--------|
| `upload_transfer_ms` | upload handler begins reading multipart file | originals S3 upload resolves | `upload_transfer_ms` |
| `queue_wait_meta_ms` | metadata job enqueued | metadata worker starts processing | `queue_wait_meta_ms` |
| `metadata_ms` | metadata worker starts | `Metadata extracted` success log | `metadata_ms` |
| `queue_wait_hls_ms` | hls job enqueued | hls worker starts processing | `queue_wait_hls_ms` |
| `hls_encode_ms` | before `processHLSAllRenditionsFromStream` | `HLS encode ... ms=...` | `hls_encode_ms` |
| `hls_segment_upload_ms` | before `flushRemaining()` | `HLS segment upload ... ms=...` | `hls_segment_upload_ms` |
| `hls_total_ms` | hls worker start | `HLS packaged ... totalMs=...` | `hls_total_ms` |

Derived aggregates:

- `pipeline_async_ms ~= metadata_ms + hls_total_ms` (quick estimate)
- `end_to_end_ms = upload_transfer_ms + queue_wait_meta_ms + metadata_ms + queue_wait_hls_ms + hls_total_ms`

---

## Current instrumentation (already present)

The codebase already logs:

- `Metadata extracted ... ms=...` in `audio-metadata.job.ts`
- `HLS encode ... ms=...`, `HLS segment upload ... ms=...`, `HLS packaged ... totalMs=...` in `audio-processing.job.ts`
- enqueue events in upload service:
  - `Queued audio-meta + HLS jobs uploadId=...`
  - queue add lines from Bull wrappers

This covers stage internals, but not exact upload transfer time and explicit queue wait per job.

---

## Required instrumentation additions

### 1) Upload transfer timing

Add in upload path (`handleUploadSermon`):

- `upload-start uploadId=... t=...`
- `upload-end uploadId=... ms=... bytes=...`

Normative fields:

```text
event=upload-transfer
uploadId=<id>
stage=start|end
ms=<duration on end>
bytes=<size>
mimeType=<audio mime>
```

### 2) Worker start + queue wait timing

On metadata worker start and HLS worker start, log:

```text
event=job-start
uploadId=<id>
queue=audio:metadata|audio:processing
jobId=<bull job id>
waitMs=<now - enqueuedAt>
```

Where `enqueuedAt` is either:

- captured from Bull job timestamp if available, or
- carried in payload as `queuedAt` at enqueue time.

### 3) Keep existing stage logs

Do not remove existing `ms` logs for metadata/encode/segment/total; they are already useful for per-stage diagnosis.

---

## Recommended log schema (structured)

Use consistent key set to simplify parsing:

```text
event
uploadId
queue
jobId
stage
ms
waitMs
bytes
s3GetBytes
workDirBytesPeak
status
```

Example success chain (same `uploadId`):

1. `event=upload-transfer stage=end ms=...`
2. `event=job-start queue=audio:metadata waitMs=...`
3. `event=metadata-extracted ms=...`
4. `event=job-start queue=audio:processing waitMs=...`
5. `event=hls-encode ms=...`
6. `event=hls-segment-upload ms=...`
7. `event=hls-packaged totalMs=...`

---

## Computation examples

For one upload:

- `queue_wait_meta_ms = metadataJobStartTs - metadataQueuedTs`
- `queue_wait_hls_ms = hlsJobStartTs - hlsQueuedTs`
- `end_to_end_ms = upload_transfer_ms + queue_wait_meta_ms + metadata_ms + queue_wait_hls_ms + hls_total_ms`

For fleet metrics:

- p50/p95 `upload_transfer_ms`
- p50/p95 `queue_wait_meta_ms`, `queue_wait_hls_ms`
- p50/p95 `metadata_ms`, `hls_total_ms`
- error-rate split by stage (`upload`, `metadata`, `hls`)

---

## Query / dashboard slices

Minimum slices by:

- `uploadId` (single trace)
- time window (hour/day)
- file size bucket (`<50MB`, `50-200MB`, `>200MB`)
- queue name
- environment (`dev/staging/prod`)

Recommended alerting:

- sustained `queue_wait_hls_ms` above threshold (capacity issue)
- p95 `hls_total_ms` regression
- metadata failure spike

---

## Validation checklist

- [ ] For a test upload, logs show all four stage timings with same `uploadId`
- [ ] `queue_wait_meta_ms` and `queue_wait_hls_ms` are non-negative and plausible
- [ ] `hls_total_ms` is >= `hls_encode_ms`
- [ ] end-to-end can be computed from logs without manual guesswork
- [ ] dashboards can chart p50/p95 per stage

---

## Non-goals

- Replacing current queue architecture
- Realtime client progress via websocket
- Deep tracing vendor lock-in (OpenTelemetry adoption can be a later phase)

