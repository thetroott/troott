# feat-0005: Production media pipeline and three-bucket storage (API)

## Summary

Align **`apps/api`** with production constraints for **1–2 hour sermon uploads**, **FFmpeg HLS packaging on EC2**, and **three S3 buckets**:

| Bucket | Purpose |
| ------ | ------- |
| **`troott-originals`** | Minister sermon source audio |
| **`troott-playback`** | HLS segments and master playlist |
| **`troott-storage`** | Images, documents, avatars, KYC |

This feature spec is the **implementation bridge** between:

- [`audio-processing-job-plan.md`](../../audio-processing-job-plan.md) — Bull/ffmpeg HLS pipeline
- [`media-compute-deployment-plan.md`](../../media-compute-deployment-plan.md) — AWS EC2, sizing, ops
- [`feature/feat-0006/`](../feat-0006/PRODUCT.md) — **Canonical** upload → processing → playback API spec

It does **not** replace those plans; it defines **what to change in code** and **acceptance criteria** for production launch on a single monolith (e.g. Coolify on `c6a.2xlarge`).

---

## Problem

Today the API:

1. Uses a **single** `AWS_BUCKET_NAME` for sermon audio, HLS output, and general uploads.
2. Defaults **`SERMON_AUDIO_MAX_BYTES` to 100 MiB** — blocks typical **2-hour MP3** uploads (~110–120 MiB).
3. HLS uploads go through `storageService.uploadFile`, which **prepends a MIME folder** (`audio/…`) — wrong for **`troott-playback`** keys (`{uploadId}/hls/…`).
4. HLS worker **concurrency is 2** with no env override — risky on **4–8 vCPU** hosts running long transcodes.
5. **SIGTERM** closes Bull workers but does **not** drain the HTTP server — bad for deploys during uploads/transcodes.
6. No **Dockerfile with ffmpeg** for EC2/Coolify deploy.

---

## Goals

1. Route uploads by asset type to **`troott-originals`**, **`troott-playback`**, **`troott-storage`** (env-driven; fallback to legacy single bucket in dev).
2. Support **512 MiB** default sermon upload cap (configurable; 1 GiB when WAV allowed).
3. Package HLS to **`{uploadId}/hls/…`** on the playback bucket; serve via **`MEDIA_CDN_BASE_URL`**.
4. Tune worker concurrency and temp disk for **1–2 hour** sermons on cost-conscious EC2.
5. **Graceful shutdown** on SIGTERM (HTTP drain + Bull close).
6. Ship a **production Docker image** with Node 22 + system ffmpeg.

---

## Non-goals

- DASH output, 2-pass loudnorm, Opus archival (see audio-processing-job-plan phase 2+).
- Splitting API and worker into separate services (deployment plan phase 2).
- CloudFront/Terraform/IAM policy JSON (documented in deployment plan; infra out of repo scope).
- Client playback UX changes (mobile/web already fall back to raw ingest until HLS ready).

---

## User-visible behavior

| Actor | Before | After |
| ----- | ------ | ----- |
| **Minister** | 2 hr MP3 may fail with 413 | Upload succeeds up to configured max (≥ 512 MiB prod) |
| **Listener** | Plays HLS when ready | Same; manifest URL resolves via CDN → **`troott-playback`** |
| **Minister (failed transcode)** | `uploadStatus=failed`, partial HLS cleaned | Same; cleanup scoped to **playback** prefix only |
| **Ops** | Single bucket blast radius | Originals retained; images unaffected by HLS re-pack |

---

## Processing SLA (internal targets)

| Stage | Target (2 hr sermon, 8 vCPU, with loudnorm) |
| ----- | ------------------------------------------ |
| Metadata | < 2 min after upload |
| HLS ready (p50) | ≤ 45 min |
| HLS ready (p95) | ≤ 90 min until tuned |

---

## Rollout phases

### Phase 1 — Code + single EC2 (P0)

- Three-bucket routing in API (env vars).
- Raised upload limit, HLS key fix, concurrency env, SIGTERM, Dockerfile.

### Phase 2 — AWS hardening (P1)

- Create buckets + IAM instance role; set env on Coolify/EC2.
- CloudFront origin on **`troott-playback`**; `MEDIA_CDN_BASE_URL`.

### Phase 3 — Reliability (P2)

- Stage timing metrics in HLS job logs.
- Reprocess endpoint for stuck `processing` (future feat).

---

## Acceptance criteria

1. Sermon audio object is written to **`troott-originals`** at `audio/{uploadId}` (or legacy bucket when env unset).
2. HLS artifacts are written to **`troott-playback`** at `{uploadId}/hls/…` without an extra `audio/` prefix.
3. `POST /storage/upload` and avatar uploads use **`troott-storage`** only.
4. A **2-hour MP3** within `SERMON_AUDIO_MAX_BYTES` is accepted (default **512 MiB** when env unset).
5. `playbackUrl` / `manifestUrl` use CDN base when `MEDIA_CDN_BASE_URL` is set.
6. `AUDIO_HLS_WORKER_CONCURRENCY` defaults to **1** in production; configurable via env.
7. SIGTERM stops accepting new HTTP connections and closes Bull workers.
8. Docker image builds with **`ffmpeg -version`** passing in CI/build.

---

## References

- [`audio-processing-job-plan.md`](../../audio-processing-job-plan.md)
- [`media-compute-deployment-plan.md`](../../media-compute-deployment-plan.md)
- [`apps/api/docs/audio-pipeline-flow.md`](../../../../apps/api/docs/audio-pipeline-flow.md) — Short code index (links to canonical spec)
- [`feature/feat-0006/`](../feat-0006/PRODUCT.md) — **Canonical** upload → processing API spec
