# feat-0029 — Technical implementation

Normative UX: [PROCESSING_ETA_SPEC.md](./PROCESSING_ETA_SPEC.md).

## 1. New util

**File:** `apps/web/src/utils/upload-processing-eta.util.ts`

```ts
export type ProcessingEtaInput = {
  durationSec: number;
  fileSizeBytes: number;
  uploadTransferSec: number | null;
  processingElapsedSec: number;
  uploadStatus: string | undefined;
};

/** null = do not show "N minutes left" */
export function estimateProcessingRemainingSec(
  input: ProcessingEtaInput,
): number | null;
```

- Import `UploadStatus` from `@/dtos/sermon-media.types` for terminal check.
- Export constants `ENCODE_FACTOR = 0.4`, `PROCESSING_OVERHEAD_SEC = 60` with comment pointing to `specs/web/feature/feat-0029/PROCESSING_ETA_SPEC.md` and API log calibration.

Unit tests: table-driven cases for Tier A/B/D and terminal → `null`.

## 2. `UploadModal.tsx` changes

1. Derive `durationSec` from `uploadedSermonDetail` (top-level + `item.duration`).
2. Derive `fileSizeBytes` from `uploadData.file?.size` ?? `item.size` on detail.
3. Replace inline `processingEtaLabel` `useMemo` with util call + `formatMinutesLeft`.
4. Add `processingTotalSecRef` for monotonic tier upgrade (set when first estimate computed; shrink-only update when duration arrives).
5. Delete literals `10 * 60`, `6 * 60` from processing path.

```tsx
const processingRemainingSec = useMemo(() => {
  if (!isProcessingActive) return null;
  return estimateProcessingRemainingSec({
    durationSec,
    fileSizeBytes,
    uploadTransferSec: uploadDurationSecRef.current,
    processingElapsedSec:
      processingStartAtRef.current != null
        ? (etaNowMs - processingStartAtRef.current) / 1000
        : 0,
    uploadStatus: serverUploadStatus,
  });
}, [/* deps */]);

const processingEtaLabel =
  processingRemainingSec != null
    ? formatMinutesLeft(processingRemainingSec)
    : null;
```

6. Footer: when `processingEtaLabel` is null and not stall, render only `pipelineLabel ?? 'Processing...'` **without** trailing `…` + empty span (avoid `Processing... …`).

## 3. Do not change

- **Transport:** no WebSocket/SSE; poll intervals in `useSermonByIdQuery` (feat-0018).
- `formatUploadPipelineLabel` strings.
- API jobs or `uploadStatus` emission.

## 4. Optional follow-up (same PR or later)

- Extract upload-transfer ETA to `upload-transfer-eta.util.ts` for testability.
- Telemetry event: `processing-eta-tier` (`duration` | `size` | `transfer` | `none`) for tuning in staging.

## 5. Cross-links after merge

Add to [feat-0018 PRODUCT.md](../feat-0018/PRODUCT.md) related docs table:

- feat-0029 PROCESSING_ETA_SPEC.md
