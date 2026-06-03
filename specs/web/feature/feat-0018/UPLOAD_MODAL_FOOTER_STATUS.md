# feat-0018: UploadModal footer status strip (cross-tab contract)

## Context

The upload wizard (`UploadModal`) is a multi-tab modal used on `/studio/:studioCode/sermons/upload/*`.

This spec defines the **footer status strip** that appears at the bottom of the wizard. The core requirement is that the user sees the **same, global upload/pipeline status** regardless of which tab they are on.

Related specs:

- **Web upload wizard host:** `feat-0018` (this feature)
- **Web CRUD flow:** [`feat-0006 TECH`](../feat-0006/TECH.md)
- **API pipeline statuses:** [`specs/api/feature/feat-0006/PRODUCT.md`](../../../api/feature/feat-0006/PRODUCT.md), [`feat-0007`](../../../api/feature/feat-0007/PRODUCT.md)

Figma source of truth (captured via `pacepard-ui-agent` on channel `fkwurfvb`):

- Uploading footer: [`6147:32932`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6147-32932&t=Mfvz2zYzXiLlakBE-4)
- Processing footer: [`4764:7916`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4764-7916&t=Mfvz2zYzXiLlakBE-4)

---

## Goals

1. **Consistency:** Footer status must not change when the user changes tabs.
2. **Truthful status:** Footer must represent the global state of the upload + server pipeline.
3. **Time-left:** When bytes are uploading **or** the server is processing, show a time-left label that remains consistent across tabs.
4. **Non-blocking UX:** During upload/processing, the user can keep editing other tabs; footer should continue reflecting state.

---

## Definitions

### Wizard “tabs”

Upload wizard steps (keys in `UploadModal.tsx`):

- `progress` (upload progress)
- `details`
- `settings`
- `review`

### Global pipeline phases (what the footer is allowed to show)

The footer is a **single state machine** derived from local progress + server status.

| Phase key | Primary source | When |
|----------|----------------|------|
| `idle` | local | file chosen but upload not started yet |
| `uploading` | local | multipart upload is transferring bytes (`0 < progress < 100`) |
| `finalizing` | local | upload is “done” client-side (`progress ≥ 100`) but server response / commit not finished (`uploadComplete=false` while loading) |
| `server-processing` | server | upload has created `sermonId`; API job pipeline is running (`item.uploadStatus ∈ {uploaded, processing}`) |
| `complete` | server | `item.uploadStatus = completed` |
| `failed` | server or local | `item.uploadStatus = failed` or client upload error |

Canonical backend status normalization for `server-processing` phase:

- `uploaded`, `extracting`, `processing` all normalize to `server-processing`.

---

## Normative UI requirements

### R1 — Footer is global and identical across tabs

- The footer status strip appears on **all wizard tabs** once a file exists.
- The rendered status text and glyphs must be derived from a **single shared computation**, not per-tab UI.
- The footer must not display “Ready when you are” while:
  - upload is in flight, **or**
  - server processing is running, **or**
  - status is failed.

### R2 — Status precedence

If multiple signals exist, use this precedence (highest wins):

1. `failed`
2. `complete`
3. `server-processing`
4. `finalizing`
5. `uploading`
6. `idle`

Rationale: server truth should override local heuristics once `sermonId` exists; failures and completion should always be explicit.

### R3 — Time-left behavior (uploading + processing)

When phase is `uploading`:

- Footer shows `Uploading {pct}% … Time left — {eta}`.
- ETA is derived from progress slope (do not hardcode).
- If not enough data points exist, render `Time left — calculating…`.

Constraints:

- ETA must never show negative time.
- ETA should be bounded to a reasonable format: `Ss` or `Mm SSs`.

When phase is `server-processing`:

- Footer shows `{processingLabel} … Time left — {eta}` (same position and typography as upload ETA).
- Footer **must show numeric minutes left** (e.g. `12 minutes left`) — not a placeholder.

Notes:

- Backend owns processing internals; web must expose only a generic processing label and ETA.
- Client-side estimator is allowed and expected. Use observable inputs (file size, elapsed upload time, elapsed processing time, historical completion durations) to output a numeric minute estimate.
- Do not expose backend sub-steps (e.g. “extracting”) in user-facing footer copy.

### R4 — Processing text

When phase is `server-processing`:

- Footer displays the human label for `item.uploadStatus` (web helper `formatUploadPipelineLabel`), e.g.:
  - `Upload received`
  - `Processing audio…`
  - and appends `… Time left — {eta}` per R3.

When phase is `finalizing`:

- Footer displays `Processing…` (waiting on the API response / server acceptance).

### R5 — “Upload complete” vs “Processing complete”

`uploadComplete` only means the HTTP upload finished and the API returned a sermon id.

- If server pipeline is still running, the footer must **not** stop at “Upload complete”.
- Once the API reports `completed`, footer shows `Processing complete` (or equivalent).

---

## Data sources

### Local signals (web)

From upload context (`UploadModal` / `useUpload`):

- `uploadData.file`
- `isLoading` (upload request in-flight)
- `progress` (0–100)
- `uploadComplete` (upload request completed successfully)
- `uploadError` (if used by progress step)

### Server signals (web)

Once `uploadData.sermonId` exists, poll sermon detail:

- `GET /api/v1/sermon/:id` (Bearer required)
- Use `item.uploadStatus` as the canonical pipeline status.

Poll guidance:

- While status ∉ {`completed`, `failed`}, poll every ~4s.
- Stop polling on `completed` or `failed`.

Single-owner polling requirement:

- Polling is owned by `UploadModal` only; tab/step children consume shared state.
- Tab changes must not create additional polling owners.
- Add duplicate-owner telemetry when invariant is violated.

Staleness and cache guidance:

- Active polling must maintain status freshness within `<= 10s`.
- Prefer cache-bypass/fresh fetch semantics for status endpoints while non-terminal.

---

## Implementation notes (non-normative)

- The footer logic should live in `UploadModal.tsx` and not be duplicated in each step component.
- Use `formatUploadPipelineLabel(uploadStatus)` for server-processing labels.
- ETA should reuse the same `progress` updates already collected for the progress bar; do not introduce a second progress source.

---

## Acceptance checklist

- [ ] Start upload, immediately switch to Details tab: footer still shows “Uploading … Time left …”
- [ ] At `progress >= 100` before `uploadComplete`: footer shows `Processing…` (finalizing)
- [ ] After `uploadComplete` while jobs run: footer shows processing copy with **numeric** minutes left (no `calculating…`)
- [ ] On completion: footer shows `Processing complete` (or `Upload complete` only if server status is also complete)
- [ ] On failure: footer shows `Processing failed` and does not revert to idle copy

