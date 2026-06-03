# feat-0011: Repeated `sermon not found` (404) on upload status polling

## Summary

While a minister or creator uploads a sermon, the web **Upload modal** polls `GET /api/v1/sermon/:id` every ~4s ([feat-0018](../../web/feature/feat-0018/UPLOAD_STATUS_POLLING_SPEC.md)). The API dev terminal repeats:

```text
ERR ErrorResponse: sermon not found
  at sermon.controller.ts:867
  statusCode: 404
```

Upload (`POST /sermon/start-upload`) and Bull jobs (metadata, HLS) may still succeed. The 404s are **misleading** — they mean the detail handler denied access to a sermon that **exists**, not that the row was deleted or upload failed.

This spec explains why polling hits 404, how it differs from [feat-0009](../feat-0009/PRODUCT.md) (creator profile noise) and [feat-0010](../feat-0010/PRODUCT.md) (minister profile 403), and what to change so studio owners can read draft/processing sermon detail without log spam.

---

## Problem

| Observation | Impact |
| ----------- | ------ |
| Terminal shows many `sermon not found` during upload follow-up | Operators think sermon create failed |
| Stack always points to `getSermonById` line ~867 (access gate) | Hard to tie to upload polling without reading controller |
| `POST /sermon/start-upload` returns 200 with `sermonId` | Client correctly starts polling; API then rejects the same id |
| Footer / progress UI may show stale or error state | User sees “could not load” while pipeline runs |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-S40401 | Minister uploading audio | `GET /sermon/:id` to return my draft while `uploadStatus` is non-terminal | Upload modal footer tracks pipeline |
| UC-S40402 | Creator uploading audio | Same access for creator studio sessions | Creator upload parity with minister |
| UC-S40403 | Operator reading logs | No repeated 404 for healthy upload sessions | Logs reflect real failures only |
| UC-S40404 | Engineer | One access rule in `sermon.service.ts`, not a new util module | Matches project API placement ([TECH.md](./TECH.md)) |

---

## Related specs (partial coverage today)

| Spec | What it covers | Gap |
| ---- | -------------- | --- |
| [feat-0018 UPLOAD_STATUS_POLLING_SPEC](../../web/feature/feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) | Web poll interval, terminal statuses, single owner | Assumes `GET /sermon/:id` returns **200** with `item.uploadStatus` |
| [feat-0020 SERMON_GET_INFO_SPEC](../../web/feature/feat-0020/SERMON_GET_INFO_SPEC.md) | Dialog 404 UX | Documents 404 message, not **why draft upload poll gets 404** |
| [feat-0006](../feat-0006/PRODUCT.md) | Upload → jobs → playback | Does not define detail **access** for draft rows |
| [deep-links.md](../../deep-links.md) | Mentions `sermon-access.util.ts` | File **does not exist**; access lives inline in controller today |

**feat-0011 is the canonical API spec** for `GET /sermon/:id` studio access during upload polling.

---

## Acceptance criteria

1. Authenticated user who just called `POST /sermon/start-upload` receives **200** from `GET /api/v1/sermon/:id` for that `sermonId` while the row is draft/processing (non-catalog).
2. Repeated polling during `uploaded` → `extracting` → `processing` does **not** emit `ERR sermon not found` in dev logs.
3. Unrelated users still receive **404** (`sermon not found`) for another user's private draft — no id enumeration leak.
4. Published catalog sermons remain readable per existing public rules.
5. Access logic lives in **`sermon.service.ts`**; `getSermonById` calls one service method — **no** new `utils/*` module ([TECH.md § API code placement](./TECH.md#api-code-placement)).
6. [feat-0018](../../web/feature/feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) polling contract unchanged (interval, terminal set); only API access fixed.

---

## Out of scope

- Web polling ownership or ETA ([feat-0029](../../web/feature/feat-0029/PROCESSING_ETA_SPEC.md))
- Setting `minister` on sermon at publish only (minister linkage at upload is optional follow-up; **uploadedBy** is sufficient for v1)
- Listener catalog / deep-link teasers (separate visibility matrix in [deep-links.md](../../deep-links.md))
- Changing 404 vs 403 semantics for forbidden vs missing id (v1 keeps single **404** envelope for private drafts)

---

## Success signal

Minister upload session: Network tab shows `GET /sermon/:id` **200** every poll interval; API terminal has **zero** `sermon not found` at `sermon.controller.ts:867` for that session.
