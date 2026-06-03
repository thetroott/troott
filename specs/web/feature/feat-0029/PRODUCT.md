# feat-0029: Upload processing time display (honest ETA)

## Summary

The upload wizard footer shows a **countdown** (“N minutes left”) during server-side HLS/metadata work. Today that countdown uses **hard-coded heuristics** (default **10 minutes**, floor **6 minutes**) that do not match real processing time (~1–3 minutes for typical test files in dev). Users believe every upload takes ~10 minutes.

This feat replaces fake ETAs with **signal-based estimates** or **indeterminate** copy until the client has enough data.

## Problem

| Symptom | Cause |
| ------- | ----- |
| Every upload shows “10 minutes left” at first | `UploadModal` fallback `10 * 60` when upload timing is missing |
| Countdown never matches wall clock | `Math.max(6 * 60, …)` floor + static formula vs FFmpeg + 3 renditions |
| “Processing…” feels stuck | Same footer for 2 min real work vs 10 min displayed |

## Normative spec

[PROCESSING_ETA_SPEC.md](./PROCESSING_ETA_SPEC.md)

## Related

| Doc | Role |
| --- | ---- |
| [feat-0018 UPLOAD_STATUS_POLLING_SPEC](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) | When polling stops; `uploadStatus` labels |
| [upload-processing-step-timings.md](../../api/upload-processing-step-timings.md) | API log fields to calibrate estimates |
| [feat-0027](../feat-0027/DRAFT_UPLOAD_MODAL_SPEC.md) | Upload modal as draft editor |
| [feat-0007 PRODUCT](../../api/feature/feat-0007/PRODUCT.md) | HLS worker pipeline |

## Definition of done

- [x] No default **10 minute** or **6 minute** floor in production ETA path.
- [x] Footer shows **no countdown** until at least one estimate signal exists (see spec).
- [x] After `GET /sermon/:id` returns `duration` > 0, ETA uses duration-based model.
- [x] When `uploadStatus` is terminal (`completed` / `failed` / `cancelled`), countdown hidden immediately.
- [ ] Manual test plan in spec passes on dev API with workers running.
