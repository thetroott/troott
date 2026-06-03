# feat-0029: Upload processing ETA — recommendations (normative)

## Summary

Define how the **studio upload wizard** communicates time remaining while the API runs metadata + HLS jobs. The UI must **not** imply a fixed ~10 minute transcode when observed backend work is often **1–3 minutes** for short files (see § Calibration).

**Scope:** Web footer in `UploadModal` during `isProcessingActive` (and optional upload-transfer ETA in the same footer). **Out of scope:** Changing FFmpeg settings, queue concurrency, or adding a new API field (listed as P2).

---

## Problem (verified)

### Current behavior

`apps/web/src/components/shared/upload/UploadModal.tsx` computes `processingEtaLabel` with:


| Rule                                          | Value                     | Effect                                                |
| --------------------------------------------- | ------------------------- | ----------------------------------------------------- |
| Default baseline when upload duration unknown | `10 * 60` seconds         | Always starts at **“10 minutes left”**                |
| Minimum total estimate                        | `6 * 60` seconds          | Never shows less than **~6 minutes** remaining at t=0 |
| Upload transfer baseline                      | `uploadDurationSec * 2.2` | Only used if transfer was timed                       |
| File size baseline                            | `(sizeMB * 60) / 15`      | Weak signal; still overridden by 6 min floor          |


The label is **not** tied to `item.uploadStatus`, sermon `duration`, or API job timing.

### Observed backend (dev, one sample)

API log (same repo, local `pnpm dev:api`):

```text
HLS packaged uploadId=file-audio-2026-06-02-14-00-38 totalMs=112931 renditions=3 s3GetBytes=11826826
```

≈ **113 s** end-to-end HLS worker time for ~11.3 MB source — far below the UI’s 10 minute default.

### User impact

- Ministers think processing is broken or unusually slow.
- Support/debugging conflates **displayed** wait with **actual** pipeline latency.
- Honest “still working” messaging is undermined by a wrong countdown.

---

## Goals

1. **Truthful:** ETA within a reasonable band of real processing for typical sermons, always show REAL  ETA - no mock data.
2. **Progressive:** Improve estimate as more signals arrive (poll returns `duration`, file size known, transfer time known).
3. **Aligned with status:** When `uploadStatus` is terminal, remove countdown; show terminal copy from [feat-0018](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md).
4. **Separate concerns:** Upload **transfer** % and **server processing** ETA use different models (already split by `isTransferring` vs `isProcessingActive`).

## Non-goals (v1)

- Sub-second accurate progress bar for FFmpeg.
- **Introducing** server-pushed WebSocket or SSE for upload status (see § Transport).
- Changing HLS rendition count or loudnorm passes.

---

## Transport: polling vs WebSocket (normative)

### Decision for feat-0029 v1

| Layer | v1 choice | Owner |
| ----- | --------- | ----- |
| **Status + duration** | **HTTP polling** `GET /api/v1/sermon/:id` | [feat-0018](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) — `UploadModal` only |
| **Minutes-left ETA** | **Client-side math** from poll payload | This spec — no extra transport |

**feat-0029 does not add WebSockets.** It only fixes how the footer interprets data the poll already returns (`uploadStatus`, `duration`, `item.size`).

### Why polling is sufficient (v1)

1. **Coarse state machine** — Happy path has four server states (`uploaded` → `extracting` → `processing` → `completed`). Updates are minutes apart, not per segment.
2. **Existing contract** — feat-0018 defines 4 s default interval, single owner, terminal stop, 30 / 60 min stall backoff. Code: `useSermonByIdQuery` in `UploadModal.tsx`.
3. **No push channel today** — API has no sermon upload WebSocket/SSE endpoint; jobs complete via Bull workers updating Mongo; clients discover via GET.
4. **ETA does not need push** — Countdown is derived from `duration` + elapsed wall time; a poll every 4 s is enough to pick up `duration` after metadata (~seconds) and `completed` within one interval.

### What polling is *not* responsible for

| Symptom | Usually |
| ------- | ------- |
| Wrong “10 minutes left” | Client heuristic (this feat) — **not** polling vs WebSocket |
| Status stuck `processing` 10+ min | Workers / Redis / FFmpeg — polling is working; server not advancing |
| Footer updates 4 s late on `completed` | Acceptable for v1; poll interval tradeoff |

### WebSocket / SSE (future — out of scope v1)

Revisit **only if** product needs one or more of:

- **Sub-second** `processingProgress` (0–100) from FFmpeg/Bull `job.progress`
- **Many concurrent** uploads per tab (polling N sermons)
- **Materially lower** API load at scale
- **Instant** terminal notification (&lt;1 s) for publish gating

If added later:

| Approach | Pros | Cons |
| -------- | ---- | ---- |
| **Keep polling** | No infra change; feat-0029 ETA unchanged | 4 s latency; N× GET under load |
| **SSE** `GET /sermon/:id/stream` | One-way, HTTP-friendly, fits status fan-out | New API + reconnect logic |
| **WebSocket** room per `sermonId` | Bi-directional if cancel/progress commands needed | Auth, scaling, Redis pub/sub |

**Normative for a future transport feat:** Push events must carry at least `uploadStatus`, `duration` (when known), and optional `processingEstimateMs` / `processingProgress`. Web **may** keep client ETA tiers as fallback when push is disconnected; **prefer** API estimate when present (§ P2).

Until then, [feat-0018](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) remains the only status transport; do not block feat-0029 on WebSocket work.

---

## Principles (normative)

1. **Never invent a fixed 10- or 6-minute processing budget** as the primary UX.
2. **Prefer server `duration`** (seconds) once metadata job has run (`extracting` and beyond).
3. **Indeterminate over wrong:** If no signal, show `Processing…` only — **omit** `"N minutes left"`.
4. **Monotonic countdown:** Remaining time may decrease; it must not jump **up** when new data arrives (recompute total once per signal tier, then only subtract elapsed).
5. **Cap display:** Do not show more than **60 minutes** remaining (existing cap); stall copy at 30 / 60 min unchanged ([feat-0018](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md)).
6. **Hide ETA on terminal status** even if `uploadComplete` is true client-side.

---

## Signals (priority order)


| Priority | Signal                       | Source                                         | Available when                                                                     |
| -------- | ---------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| P0       | Terminal `uploadStatus`      | `useSermonByIdQuery` → `item.uploadStatus`     | `completed` / `failed` / `cancelled`                                               |
| P1       | Audio **duration** (sec)     | Same GET: `duration` and/or `item.duration`    | After metadata job (~seconds post-upload)                                          |
| P2       | **File size** (bytes)        | `uploadData.file.size` or `item.size` from GET | After file pick / upload                                                           |
| P3       | **Upload transfer** duration | `uploadDurationSecRef` (client)                | After multipart finishes                                                           |
| P4       | **Pipeline stage**           | `uploadStatus`                                 | `uploaded` vs `extracting` vs `processing` — adjusts copy, not required for ETA v1 |


### Duration field resolution (normative)

```text
durationSec =
  first positive number among:
    uploadedSermonDetail.duration,
    uploadedSermonDetail.item?.duration,
    0
```

---

## Recommended ETA model (v1 — client only)

Implement in a pure util (see [TECH.md](./TECH.md)): `estimateProcessingRemainingSec(input) → number | null`.

`null` means **do not render** a countdown.

### Inputs

```ts
type ProcessingEtaInput = {
  durationSec: number;
  fileSizeBytes: number;
  uploadTransferSec: number | null;
  processingElapsedSec: number;
  uploadStatus: string | undefined;
};
```

### Step 1 — Terminal gate

If `uploadStatus` is `completed`, `failed`, or `cancelled` → return `null` (footer uses `pipelineLabel` only).

### Step 2 — Estimate total processing time `totalSec`

Use **first matching tier**; do not combine tiers in a way that increases total when a better signal arrives (see monotonic rule below).

#### Tier A — Duration known (`durationSec > 0`) — **preferred**

Calibrated from staging/dev logs (§ Calibration):

```text
encodeFactor = 0.40        // ~0.4× realtime for 3-rendition HLS + loudnorm on typical hardware
overheadSec  = 60          // queue + metadata + manifest upload

totalSec = clamp(
  round(durationSec * encodeFactor + overheadSec),
  min = 45,
  max = durationSec * 2 + 180
)
```

Examples:


| Sermon length   | `totalSec` (approx)             |
| --------------- | ------------------------------- |
| 5 min (300 s)   | 180 s (~3 min)                  |
| 30 min (1800 s) | 780 s (~13 min)                 |
| 60 min (3600 s) | 1500 s (~25 min), capped by max |


#### Tier B — File size only (`fileSizeBytes > 0`, no duration yet)

Use between upload complete and first poll with duration:

```text
sizeMb = fileSizeBytes / (1024 * 1024)
totalSec = clamp(round(sizeMb * 12), min = 60, max = 3600)
```

(~12 s per MB observed order-of-magnitude for ~11 MB → ~2 min; tune with logs.)

#### Tier C — Upload transfer only (`uploadTransferSec > 0`, no duration/size)

```text
totalSec = clamp(round(uploadTransferSec * 2.5), min = 90, max = 1800)
```

#### Tier D — No signal

```text
totalSec = undefined  →  return null (indeterminate)
```

**Remove:** `10 * 60` default and `6 * 60` floor from Tier A/B/C.

### Step 3 — Remaining seconds

```text
remainingSec = max(0, totalSec - processingElapsedSec)
displaySec   = clamp(remainingSec, min = 0, max = 3600)
```

If `displaySec < 30` and status is non-terminal → show `**Less than a minute left**` (or hide sub-minute countdown — product choice: **show** “Less than a minute left”).

### Monotonic rule when tier upgrades

When poll upgrades Tier B → Tier A:

- Set `totalSecAtProcessingStart` ref **once** per processing session, or
- Recompute `totalSec` only if `newTotalSec < previousRemainingSec + processingElapsedSec` (never show a **larger** remaining than before).

Normative: store `processingTotalSecRef` when first non-null `totalSec` is computed; allow **one downward** adjustment when `durationSec` arrives if new total is lower.

---

## Footer copy (normative)


| State                                      | Primary text                       | Secondary (ETA)                                                              |
| ------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------- |
| Transferring                               | `Uploading {progress}%`            | Upload transfer ETA (existing `uploadEtaLabel` logic; optional separate fix) |
| Processing, non-terminal                   | `pipelineLabel` or `Processing...` | `formatMinutesLeft(remaining)` **only if** util returns number               |
| Processing, no ETA signal                  | `Processing...`                    | **empty** (no `… 10 minutes left`)                                           |
| Stall warn (≥30 min since upload complete) | `Still processing...`              | optional ETA or empty                                                        |
| Stall error (≥60 min)                      | `Processing is taking too long`    | empty                                                                        |
| Terminal `completed`                       | `Processing complete`              | empty                                                                        |


Status labels: `formatUploadPipelineLabel` in `upload-pipeline-label.util.ts` (unchanged).

---

## Upload transfer ETA (secondary recommendation)

Current upload ETA uses progress rate; acceptable for v1. Optional improvement (same feat or follow-up):

- Do not show “calculating…” for more than 3 s; then show indeterminate “Uploading…” without minutes.

Not blocking for processing ETA acceptance.

---

## Calibration & ops

### How to tune `encodeFactor` / `overheadSec`

Use [upload-processing-step-timings.md](../../api/upload-processing-step-timings.md):

1. Run 3–5 uploads (short ~5 min, medium ~30 min, long ~60 min audio).
2. From API logs per `uploadId`, record `hls_total_ms` (and `metadata_ms`).
3. Compute `hls_total_ms / (durationSec * 1000)` → average → set `encodeFactor` with ~20% headroom.

Document chosen constants in `apps/web/src/utils/upload-processing-eta.util.ts` header comment.

### Distinguish “slow UI” vs “slow API”


| Check                                     | Slow UI (this feat) | Slow API             |
| ----------------------------------------- | ------------------- | -------------------- |
| Footer says 10 min, done in 2 min         | Yes                 | No                   |
| `uploadStatus` stuck `processing` >10 min | Maybe polling       | Workers/Redis/FFmpeg |
| Log `totalMs` > 600000                    | No                  | Yes                  |


---

## P2 — API-assisted estimate (optional, not v1)

Delivered over **polling or push** — transport-agnostic. v1 still uses poll-only `GET /sermon/:id`.

Add optional fields on sermon detail (future API feat):

```json
{
  "item": {
    "uploadStatus": "processing",
    "processingEstimateMs": 120000,
    "processingProgress": 42
  }
}
```

Web would prefer API estimate over client tiers when present. **Not required** for feat-0029 v1.

---

## Acceptance criteria

1. Fresh upload with no `duration` on first poll: footer shows **Processing…** without **10 minutes left**.
2. Within ~5 s of metadata, when GET returns `duration > 0`: countdown appears and is **≤ 15 minutes** for a **≤ 30 minute** sermon (config-dependent).
3. For a **~2 minute** HLS job (dev sample class), user sees countdown topping out around **2–4 minutes**, not 10.
4. On `uploadStatus === completed`, countdown disappears within one poll cycle.
5. Tier upgrade (size → duration) does not increase displayed minutes remaining.
6. Stall messages at 30 / 60 min still work ([feat-0018](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md)).

---

## Manual test plan


| #   | Action                         | Expected                                                                          |
| --- | ------------------------------ | --------------------------------------------------------------------------------- |
| 1   | Upload ~5 min MP3              | No “10 minutes left” at start; after extracting, ETA ~2–5 min band                |
| 2   | Upload ~45 min MP3             | ETA scales up (roughly proportional to length), not capped at 10 min fake default |
| 3   | Watch API complete             | Footer → “Processing complete”; no countdown                                      |
| 4   | Throttle network (slow upload) | Transfer ETA may show; processing ETA uses duration after poll                    |
| 5   | Stop Redis/workers             | Status stuck; stall warn at 30 min — not mistaken for “normal 10 min”             |


---

## Implementation map


| Area             | File                                                    |
| ---------------- | ------------------------------------------------------- |
| ETA util (new)   | `apps/web/src/utils/upload-processing-eta.util.ts`      |
| Footer           | `apps/web/src/components/shared/upload/UploadModal.tsx` |
| Tests (optional) | `apps/web/src/utils/upload-processing-eta.util.test.ts` |


Details: [TECH.md](./TECH.md).

---

## Related specs


| Doc                | Link                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------- |
| Polling lifecycle  | [feat-0018 UPLOAD_STATUS_POLLING_SPEC.md](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) |
| API timings        | [upload-processing-step-timings.md](../../api/upload-processing-step-timings.md)      |
| Draft upload modal | [feat-0027 DRAFT_UPLOAD_MODAL_SPEC.md](../feat-0027/DRAFT_UPLOAD_MODAL_SPEC.md)       |
| HLS pipeline       | [feat-0007 PRODUCT.md](../../api/feature/feat-0007/PRODUCT.md)                        |


