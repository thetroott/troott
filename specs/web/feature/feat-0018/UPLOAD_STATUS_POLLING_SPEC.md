# feat-0018: Upload status polling lifecycle (web)

## Context

During sermon upload follow-up, the web UI polls `GET /api/v1/sermon/:id` to track `item.uploadStatus`.

Observed response shape (example):

```json
{
  "data": {
    "item": {
      "itemId": "file-audio-2026-06-02-08-13-37",
      "uploadStatus": "extracting"
    },
    "id": "6a1e8355b3040255e31ad7f9"
  },
  "message": "Sermon fetched successfully (cached)",
  "status": 200
}
```

The status can remain non-terminal (`extracting` / `processing`) for minutes. This is expected backend behavior while metadata + HLS jobs run.

---

## Problem

UI appears to poll repeatedly for too long, and users can see inconsistent footer copy if polling ownership is duplicated.

Main causes:

1. `extracting` is non-terminal, so polling intentionally continues.
2. Polling can be triggered in more than one upload component if not centralized.
3. There is no explicit max-duration / stalled guard in UI polling contract.

---

## Goal

Define a deterministic polling lifecycle so the upload UI:

- polls exactly as long as needed
- avoids duplicate requests from multiple components
- handles long-running non-terminal statuses without ambiguity
- gives clear user-facing state while polling continues

**Processing countdown (ETA):** Polling supplies `uploadStatus` and `duration` for footer copy; the **minutes-left** heuristic is specified separately in [feat-0029 PROCESSING_ETA_SPEC.md](../feat-0029/PROCESSING_ETA_SPEC.md) (do not use fixed 10-minute defaults).

---

## Status model

From web enum (`apps/web/src/dtos/sermon-media.types.ts`):

- Non-terminal: `uploading`, `uploaded`, `extracting`, `processing`
- Terminal: `completed`, `failed`, `cancelled`

Normative terminal set for polling stop:

- `completed`
- `failed`
- `cancelled`

---

## API emission timing (when each status should be sent)

`GET /api/v1/sermon/:id` returns `data.item.uploadStatus`. The table below defines when API is expected to emit each status for upload-driven sermon flow.

**Access prerequisite:** Poll requests must receive **200** for the uploader on draft/processing rows. If API returns **404** `sermon not found` while upload jobs run, fix per [feat-0011 API spec](../../../api/feature/feat-0011/PRODUCT.md) before tuning poll intervals.

| UploadStatus | When API should emit it | Current implementation notes |
| --- | --- | --- |
| `IDLE` | Before any upload starts (draft with no audio yet). | Not usually seen in sermon upload flow after file select. |
| `UPLOADING` | While bytes are transferring from client to API/S3. | Currently tracked client-side only; API does not persist per-chunk state. |
| `UPLOADED` | Raw file is fully persisted to originals S3 and sermon row saved. | Set in `sermon.service.ts` on upload success. |
| `EXTRACTING` | Metadata extraction job is running (duration/bitrate parse). | Set in `audio-metadata.job.ts`. |
| `PROCESSING` | HLS/transcode packaging job has started and is still running. | Set at HLS job start in `audio-processing.job.ts`. |
| `COMPLETED` | HLS packaging finished and playback manifest is ready. | Set at HLS success in `audio-processing.job.ts`. |
| `FAILED` | Metadata/HLS processing failed and pipeline cannot complete. | Set on HLS job failure in `audio-processing.job.ts`. |
| `CANCELLED` | User or system cancelled processing before completion. | Defined in enum; currently not emitted by upload pipeline code. |

### Expected transition order (happy path)

`UPLOADED -> EXTRACTING -> PROCESSING -> COMPLETED`

Failure path:

`UPLOADED -> EXTRACTING|PROCESSING -> FAILED`

Cancellation path (when implemented):

`UPLOADED|EXTRACTING|PROCESSING -> CANCELLED`

Polling implication:

- Continue polling through `uploaded`, `extracting`, `processing`.
- **Stop polling in the same request/response cycle** that returns `uploadStatus: "completed"`, `failed`, or `cancelled` — see [P4b](#p4b--stop-on-terminal-response-requestresponse-cycle). No additional interval GET after a terminal response.

---

## Polling contract

### P1 — Single owner

Only **one** component/hook owns polling for upload status at a time (recommended owner: `UploadModal`).

Any child views (e.g. progress step) consume derived status from shared state and must not start independent polling.

Normative enforcement:

- `UploadModal` is the only allowed polling owner for a given `sermonId`.
- Child steps (`progress`, `details`, `settings`, `review`) must consume shared status and must not start polling queries for the same `sermonId`.
- If a second owner is detected, emit `upload-status-poll-duplicate-owner` and disable the secondary owner.

### P2 — Start condition

Start polling when:

- `uploadData.sermonId` exists, and
- upload has transitioned out of raw transfer into server pipeline follow-up.

### P3 — Interval

Default polling interval: `4000ms`.

Cache/staleness contract:

- Poll requests must bypass stale cached status (`uploadStatus`) and force fresh fetch semantics.
- Maximum acceptable staleness for displayed `uploadStatus` while polling is active: `<= 10s`.
- If backend/network constraints prevent hard bypass, the UI must surface stale age telemetry and treat stale responses above bound as degraded.

### P4 — Stop condition

Stop polling when `item.uploadStatus` is terminal:

- `completed` OR `failed` OR `cancelled`.

Implementation note:

- `cancelled` is part of the enum stop set, but API cancellation emission is not yet implemented in current upload pipeline code. Until cancellation endpoint/worker flow ships, treat `cancelled` as reserved terminal support and do not claim active cancel UX in web.

### P4b — Stop on terminal **response** (request/response cycle)

Polling must end **in the same cycle** that receives a terminal status — not on a later tick or after an extra scheduled interval.

Normative behaviour:

1. **Request:** `GET /api/v1/sermon/:id` (poll owner: `UploadModal` / `useSermonByIdQuery`).
2. **Response:** `200` with `data.item.uploadStatus === "completed"` (or `failed` / `cancelled`).
3. **Immediate stop:** Before scheduling the next poll, the client sets `refetchInterval` to `false` so **no further interval-driven GET** runs for that upload session.
4. **That response is the last scheduled poll** for pipeline follow-up unless the user explicitly retries/refreshes.

Example terminal response (stop after this):

```json
{
  "error": false,
  "status": 200,
  "data": {
    "id": "6a204796bd6294eee9ca95ea",
    "item": {
      "itemId": "file-audio-2026-06-03-17-09-53",
      "uploadStatus": "completed"
    }
  },
  "message": "Sermon fetched successfully"
}
```

After this response:

- `refetchInterval` → `false`
- Emit `upload-status-poll-stop` with `{ reason: "terminal", uploadStatus: "completed" }`
- Footer → **Processing complete** ([UI copy contract](#ui-copy-contract))
- **Must not** fire another poll 4s later because status was non-terminal on the *previous* tick

Implementation (`UploadModal` / `useSermonByIdQuery`):

```ts
refetchInterval: (query) => {
  const status = query.state.data?.item?.uploadStatus;
  if (
    status === UploadStatus.COMPLETED ||
    status === UploadStatus.FAILED ||
    status === UploadStatus.CANCELLED
  ) {
    return false; // stop — do not schedule next interval
  }
  return 4000;
},
```

After terminal status is observed:

- Set `refetchOnWindowFocus: false` for the pipeline status query so tab focus does not restart de facto polling.
- `refetchOnReconnect` may refetch **only while** status is still non-terminal; if last known status was terminal, do not refetch on reconnect.

**Anti-patterns (forbidden):**

- One extra poll after `completed` “to confirm”
- Stopping only when user leaves the modal while interval still runs
- Using a fixed timer unrelated to `uploadStatus` in the response body
- Treating `completed` as non-terminal and continuing to poll for `manifestUrl` separately

### P5 — Stalled guard

If status remains non-terminal beyond a configurable window (e.g. 30 minutes):

- keep the most recent status visible
- switch UI copy to "Still processing…"
- reduce poll frequency (e.g. 10-15s) or show a retry action
- emit telemetry event `upload-status-stalled`.

Normative thresholds and actions:

- `STALL_WARN_MS = 30 * 60 * 1000`
- `STALL_ERROR_MS = 60 * 60 * 1000`
- At `STALL_WARN_MS`: show warning copy ("Still processing... this is taking longer than usual"), keep latest known status, back off polling to `10s`.
- At `STALL_ERROR_MS`: show actionable copy ("Processing is taking too long"), expose retry/refresh affordance, back off polling to `15s`.
- Polling must continue unless user exits modal or terminal status arrives.

### P6 — Modal/tab behavior

Tab switches must not create new polling streams. Polling survives tab changes and modal internal navigation.

---

## UI copy contract

User-facing statuses:

- `Uploading {pct}% ... {eta}`
- `Processing... {eta}`
- `Processing complete`
- `Processing failed`

Do not expose backend-only step names if product does not want them (e.g. "Extracting audio...").

When backend sends `extracting`, map to generic processing copy.

Canonical backend-to-UI mapping (single source of truth):

| Backend `item.uploadStatus` | Footer label | Poll action |
| --- | --- | --- |
| `uploaded` | `Processing...` | continue |
| `extracting` | `Processing...` | continue |
| `processing` | `Processing...` | continue |
| `completed` | `Processing complete` | **stop immediately** ([P4b](./UPLOAD_STATUS_POLLING_SPEC.md#p4b--stop-on-terminal-response-requestresponse-cycle)) |
| `failed` | `Processing failed` | **stop immediately** |
| `cancelled` | `Processing cancelled` | **stop immediately** |

ETA source contract for processing:

- Preferred: API-provided ETA field (if/when exposed) is authoritative.
- Current fallback: web heuristic estimator is allowed, but must be bounded and deterministic.
- Heuristic bounds:
  - minimum displayed value: `1 minute left` while non-terminal
  - maximum displayed value: `60 minutes left` before stalled UX takes over
  - formatting must be numeric minutes (no blank/placeholder once processing phase is active).

---

## Telemetry

Every poll cycle should include:

- `uploadId`
- `sermonId`
- `uploadStatus`
- `pollMs`
- `attempt`
- `elapsedSinceUploadCompleteMs`
- `owner` (poll owner id, e.g. `UploadModal`)
- `isDuplicateOwner` (boolean)
- `statusStalenessMs`

Recommended events:

- `upload-status-poll-start`
- `upload-status-poll-stop` (include terminal status)
- `upload-status-stalled`
- `upload-status-poll-duplicate-owner`

Observability acceptance:

- Track `pollRequestCountPerSession`.
- Track stop reason distribution (`terminal`, `modal-close`, `error`, `timeout`).
- Alert if duplicate owner rate is non-zero in steady state.

---

## Acceptance criteria

- [ ] Exactly one active polling loop per upload modal session.
- [ ] Polling continues on `extracting` / `processing`, stops on `completed|failed|cancelled`.
- [ ] When `GET /sermon/:id` returns `"uploadStatus": "completed"`, **no further interval poll** is scheduled ([P4b](#p4b--stop-on-terminal-response-requestresponse-cycle)).
- [ ] Terminal response emits `upload-status-poll-stop` with `reason: terminal`.
- [ ] No duplicate requests on tab change after terminal (`refetchOnWindowFocus` off for pipeline query).
- [ ] Long-running non-terminal statuses surface a clear "still processing" UX path.
- [ ] Footer status remains consistent across tabs while polling.
- [ ] Active polling status staleness remains <= 10s.
- [ ] Processing ETA uses defined source contract and bounded fallback behavior.
- [ ] Duplicate owner telemetry is emitted when guardrail is violated.

---

## Related

- [`UPLOAD_MODAL_FOOTER_STATUS.md`](./UPLOAD_MODAL_FOOTER_STATUS.md)
- [`specs/api/feature/feat-0006/PRODUCT.md`](../../../api/feature/feat-0006/PRODUCT.md)
- [`specs/api/feature/feat-0007/TECH.md`](../../../api/feature/feat-0007/TECH.md)
