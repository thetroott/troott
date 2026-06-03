# feat-0007: Stream-native sermon audio upload and processing (API)

## Summary

Refactor the sermon audio pipeline so **bytes flow through Node streams and FFmpeg pipes** end to end. The API must **not** download a full ingest copy or write a **lossless normalized intermediate** (e.g. `normalized.wav`) before HLS packaging.

| Stage | Stream-native behavior |
| ----- | ---------------------- |
| **Upload** | Multipart → S3 multipart upload (`Body: stream`) — unchanged |
| **Metadata** | `audio:metadata` reads **`sourceS3Key`** from originals (no upload tee) |
| **HLS job** | **One S3 read** → **`processHLSAllRenditionsFromStream`** (loudnorm → AAC → all HLS renditions in one FFmpeg) |
| **Segment egress** | **`HlsIncrementalUploader`** — each `.ts` uploaded and unlinked as FFmpeg closes it |
| **Master playlist** | Built in memory → uploaded via readable stream (no temp file) |

Supersedes the disk-heavy steps in [`feat-0006`](../feat-0006/TECH.md) §4.2 (full ingest download + `normalized.wav`). Bucket routing and upload contract remain in feat-0006.

---

## Loudnorm output: AAC, not WAV

After loudness normalization, the pipeline must encode **AAC** and must **not** materialize a full **WAV/PCM** file on disk or as a standalone intermediate.

| Format | Role in Troott | Verdict |
| ------ | -------------- | ------- |
| **WAV (PCM)** | Uncompressed intermediate (~1.2 GiB for 2 hr stereo) | **Rejected** for processing — disk-heavy, slow, caused Bull stalls |
| **AAC (inline after `-af loudnorm`)** | Delivery codec inside the same FFmpeg pass as HLS | **Required** — matches playback ladder (`-c:a aac`) |
| **Stored normalized master** | Optional future archival in originals | **Non-goal** unless product asks for re-process masters |

**Why WAV was used historically:** FFmpeg examples often pipe loudnorm to `-f wav` because PCM is a simple lossless container. That is a **debugging convenience**, not a production requirement.

**Recommended pattern (implemented):**

```text
S3 stream → stdin → -af loudnorm=… → -c:a aac → -f hls → segments
```

**Do not:**

```text
loudnorm → normalized.wav (disk) → second FFmpeg → AAC/HLS
```

If a standalone normalize helper is needed (pipe-only, no disk), it must output **AAC** (`-c:a aac -f adts pipe:1`), not WAV.

**Trade-off:** Optional **2-pass loudnorm** adds one extra S3 read (measure pass); default is **one read** for encode. No full-file spool.

---

## Problem

The HLS worker currently:

1. Downloads the entire original to **`ingest`** on disk.
2. Writes a full **`normalized.wav`** (PCM — often **~10× larger** than MP3 source, e.g. ~1.2 GiB for 2 hr).
3. Encodes HLS from that file in a **second** FFmpeg pass.

For 1–2 hour sermons this consumes **2×+ source size** on disk, slows jobs, and triggers Bull **“job stalled”** failures when processing exceeds the default 30s lock window.

---

## Goals

1. **Zero full-file spool** on the worker for ingest or loudnorm.
2. **One FFmpeg process per rendition:** loudnorm → **AAC** → HLS in a **single pass** (no WAV intermediate).
3. **Stream uploads** to the playback bucket for every artifact (segments, playlists, master).
4. **Long-running job support** — extended Bull `lockDuration` and `job.progress()` heartbeats during transcode.
5. Keep mandatory loudnorm ([`feat-0006`](../feat-0006/PRODUCT.md)).

---

## Non-goals

- Eliminating **HLS segment files** on disk during FFmpeg mux (FFmpeg HLS muxer requires segment paths today). Segments are **short-lived** (incremental upload then delete).
- ~~Single FFmpeg pass for all renditions~~ — **shipped (P2)**.
- External transcoder (MediaConvert / dedicated workers) — deferred; see [`media-compute-deployment-plan.md`](../../media-compute-deployment-plan.md).
- Changing upload endpoint contract (`POST /sermon/start-upload`).

---

## Allowed disk use (explicit)

| Artifact | Allowed? | Lifetime |
| -------- | -------- | -------- |
| Full ingest copy | **No** | — |
| Full normalized WAV / PCM file | **No** | — |
| Full normalized AAC file on disk | **No** | AAC only inside FFmpeg → HLS segments |
| HLS `.ts` segment while uploading | **Yes** | Until `putStreamAtKey` completes |
| Variant `playlist.m3u8` on disk | **Yes** | Until uploaded |
| FFmpeg scratch in `HLS_WORK_DIR` | **Yes** | Per-rendition subdir; removed after upload |

---

## User-visible behavior

No change to ministers or listeners — same `uploadStatus` states and playback URL order as feat-0006. Processing should **fail less often** on long sermons (no stall from default Bull lock).

---

## Acceptance criteria

1. HLS worker **never** writes `ingest`, `normalized.wav`, or any standalone normalized master under the work dir.
2. Each rendition opens **`getObjectStream(sourceS3Key, 'originals')`** and pipes to FFmpeg stdin.
3. Loudnorm filter matches `mediaConfig.sermonAudioLoudnormFilter`; **next codec is AAC** (`-c:a aac`) before HLS mux — **not** `-f wav`.
4. Master `master.m3u8` uploaded without a temp file on disk.
5. `audio:processing` queue uses **`lockDuration` ≥ 3 hours** and the job calls **`job.progress()`** at rendition boundaries.
6. Upload path (`handleUploadSermon`) remains streaming to S3 (no regression).

---

## Current approach: strengths and costs

The **implemented** design (feat-0007 phase 1) is the right default for 1–2 hour sermons on a single EC2/API worker. It is **not** zero-disk (HLS segments are short-lived files).

| Strength | Cost / limitation |
| -------- | ----------------- |
| No multi‑GiB ingest or WAV on disk | **N renditions ⇒ N S3 reads** of the same original |
| One FFmpeg pass per rendition (loudnorm → AAC → HLS) | **N loudnorm passes** (CPU repeats per rendition) |
| Streaming upload + segment stream egress | FFmpeg HLS mux still writes `.ts` locally before upload |
| Long job stability (`lockDuration`, `job.progress`) | Renditions run **sequentially** — longer wall time than parallel |
| Simpler ops (5–15 GiB scratch vs 15–50 GiB) | Single-pass loudnorm — less accurate than 2-pass (acceptable for sermons) |
| Pipe failures harder to replay than file-based debug | Add metrics/logging before tuning (see optimization roadmap) |

---

## Optimization roadmap (shipped)

Prioritized improvements after phase 1 — **implemented** without reintroducing **`normalized.wav`** or full ingest spool.

### P1 — One S3 read (shipped; no spool)

**Shipped:** one `getObjectStream` per encode; optional second read only when `AUDIO_LOUDNORM_TWO_PASS=true`. **No** compressed spool on disk.

### P2 — Single FFmpeg + incremental segments (shipped)

**Shipped:** `processHLSAllRenditionsFromStream` + `HlsIncrementalUploader`.

### P3 — 2-pass loudnorm (shipped, opt-in)

**Shipped:** `AUDIO_LOUDNORM_TWO_PASS=true`. External transcoder offload remains a separate deployment concern (not in API code).

### Explicit non-optimizations

| Do not do | Why |
| --------- | --- |
| Revert to `normalized.wav` | ~10× source size; caused disk and stall failures |
| Parallel renditions on one CPU without sizing | `AUDIO_HLS_WORKER_CONCURRENCY` > 1 on long jobs risks OOM/CPU thrash |
| In-memory full sermon buffer | 512 MiB–1 GiB+ per job — not viable on 16 GiB hosts |
| Lambda for 1–2 hr HLS | Exceeds 15-minute limit |

### Metrics before changing design

Track in `audio-hls-processor` logs or APM:

- Job wall time vs sermon duration
- S3 `GetObject` bytes per `uploadId` (expect ~N × source size today)
- Peak disk use under `HLS_WORK_DIR`
- Bull stalled/failed rate on `audio:processing`
- p50/p95 time per rendition

Optimize P1 when **S3 read multiplier** or **total CPU time** dominates over **disk headroom**.

---

## Omissions & deferred

feat-0007 covers **stream-native HLS** (single-read multi-rendition FFmpeg, incremental segment upload), **optional 2-pass loudnorm**, and **long Bull locks**. Items below are delegated or deferred.

### Pipeline & jobs — delegated or follow-up

| Topic | Current behavior (code) | Gap / recommendation | Owner |
| ----- | ------------------------- | -------------------- | ----- |
| **`audio:metadata` job** | Reads **`sourceS3Key`** from originals via `getObjectStream`; Bull payload is JSON-safe | Metadata failure does not set `failed`; duration may lag HLS |
| **Partial HLS failure** (e.g. rendition 2/3 fails) | **`deleteObjectsByPrefix(`${uploadId}/hls/`)`** on playback; `uploadStatus = failed`; no partial playback | All-or-nothing cleanup — successful renditions discarded. **Recommend:** document in feat-0006 client messaging; optional future “resume from rendition N”. | feat-0006 PRODUCT; feat-0007 P2 |
| **HLS job retry** | Bull **`attempts: 3`** re-runs **entire** job from rendition 1 | No checkpoint / idempotent per-rendition retry. **Recommend:** accept full re-encode on retry until P1 spool or resume spec exists. | feat-0007 TECH §4 |
| **Metadata vs HLS race** | Jobs run **in parallel** after upload | Client may see `completed` with `duration = 0`, or skip `extracting`. Status enum in feat-0006; polling guidance not in feat-0007. **Recommend:** UI treats **`completed`** as playback-ready; **`duration`** may lag. | [feat-0006 PRODUCT](../feat-0006/PRODUCT.md) |

### Code cleanup — completed (feat-0007 phase 2)

Removed from `apps/api` (see git history):

| Symbol | File | Status |
| ------ | ---- | ------ |
| `ProcessHLS` | `audio.service.ts` | **Deleted** |
| `EncodeMultiBitrate` | `audio.service.ts` | **Deleted** |
| `runCli` | `audio.service.ts` | **Deleted** |
| `NormaliseAudio` | `audio.service.ts` | **Deleted** |
| Legacy DTOs | `sermon.dto.ts`, `sermon.interface.ts` | **Deleted** |

**Keep:** `processHLSAllRenditionsFromStream`, `measureLoudnormFilterFromStream`, private `spawnFFmpeg`, `FFmpegOptionsDTO` (internal).

### Documentation & spec hygiene

| Item | Resolution |
| ---- | ---------- |
| Log labels | Normative labels: **`HLS rendition encode`**, **`HLS rendition upload`**, **`HLS packaged`** (match [`audio-processing.job.ts`](../../../../apps/api/src/tasks/jobs/audio-processing.job.ts)) |
| TECH section numbering | §8 Optimization, §9 Related specs (fixed in TECH.md) |
| Email template path | Fixed in code; tangential to audio — see TECH §5 |

### Streaming edge cases — not specified in phase 1

| Risk | Recommendation (deferred) |
| ---- | --------------------------- |
| S3 → FFmpeg **backpressure** | Timeouts + structured errors on pipe stall |
| **Non-seekable** pipe inputs | Prefer P1 compressed spool for problematic codecs |
| Metadata **stream in Redis** | Metadata uses S3 key (implemented) | — |

### Lifecycle — delegated (not re-spec’d here)

| Topic | Spec |
| ----- | ---- |
| Upload endpoint, buckets, `uploadStatus` | [feat-0006](../feat-0006/PRODUCT.md) |
| EC2 disk, CDN, deploy | [feat-0005](../feat-0005/PRODUCT.md), [media-compute-deployment-plan.md](../../media-compute-deployment-plan.md) |
| Reprocess stuck `processing` | feat-0005 phase 3 |
| Web processing UI / polling | [web feat-0018](../../web/feature/feat-0018/PRODUCT.md), feat-0006 |

---

## References

- [`feat-0006/PRODUCT.md`](../feat-0006/PRODUCT.md) — upload → processing contract
- [`feat-0005/PRODUCT.md`](../feat-0005/PRODUCT.md) — three-bucket rollout
- [`apps/api/docs/audio-pipeline-flow.md`](../../../../apps/api/docs/audio-pipeline-flow.md) — code index
