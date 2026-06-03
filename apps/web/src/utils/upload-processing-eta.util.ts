/**
 * Processing-time ETA for studio upload footer (feat-0029).
 * @see specs/web/feature/feat-0029/PROCESSING_ETA_SPEC.md
 * Calibrate ENCODE_FACTOR / PROCESSING_OVERHEAD_SEC via API `HLS packaged ... totalMs=` logs.
 */
import { UploadStatus } from '@/dtos/sermon-media.types';

/** ~0.4× realtime for 3-rendition HLS + loudnorm (dev/staging sample). */
export const ENCODE_FACTOR = 0.4;

/** Queue + metadata + manifest upload overhead (seconds). */
export const PROCESSING_OVERHEAD_SEC = 60;

const MIN_TOTAL_DURATION_TIER_SEC = 45;
const MIN_TOTAL_SIZE_TIER_SEC = 60;
const MAX_TOTAL_SIZE_TIER_SEC = 3600;
const MIN_TOTAL_TRANSFER_TIER_SEC = 90;
const MAX_TOTAL_TRANSFER_TIER_SEC = 1800;
const MAX_DISPLAY_REMAINING_SEC = 3600;
const LESS_THAN_MINUTE_THRESHOLD_SEC = 30;

const TERMINAL_STATUSES = new Set<string>([
    UploadStatus.COMPLETED,
    UploadStatus.FAILED,
    UploadStatus.CANCELLED,
]);

export type ProcessingEtaInput = {
    durationSec: number;
    fileSizeBytes: number;
    uploadTransferSec: number | null;
    processingElapsedSec: number;
    uploadStatus: string | undefined;
};

function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

export function isTerminalUploadStatus(
    uploadStatus: string | undefined,
): boolean {
    return (
        uploadStatus != null && TERMINAL_STATUSES.has(uploadStatus)
    );
}

/** First positive duration from sermon detail poll payload. */
export function pickSermonDurationSec(detail: unknown): number {
    const d = detail as
        | { duration?: number; item?: { duration?: number } }
        | undefined;
    if (!d) {
        return 0;
    }
    for (const value of [d.duration, d.item?.duration]) {
        if (
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value > 0
        ) {
            return value;
        }
    }
    return 0;
}

/** Local file size wins; else `item.size` from GET sermon. */
export function pickSermonFileSizeBytes(
    detail: unknown,
    localFileSize?: number,
): number {
    if (
        typeof localFileSize === 'number' &&
        Number.isFinite(localFileSize) &&
        localFileSize > 0
    ) {
        return localFileSize;
    }
    const size = (detail as { item?: { size?: number } } | undefined)?.item
        ?.size;
    if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
        return size;
    }
    return 0;
}

/**
 * Estimated total server processing time (seconds) from best available tier.
 * `null` = indeterminate (no countdown).
 */
export function estimateProcessingTotalSec(
    input: Omit<ProcessingEtaInput, 'processingElapsedSec'>,
): number | null {
    const { durationSec, fileSizeBytes, uploadTransferSec } = input;

    if (durationSec > 0) {
        const raw = Math.round(
            durationSec * ENCODE_FACTOR + PROCESSING_OVERHEAD_SEC,
        );
        return clamp(
            raw,
            MIN_TOTAL_DURATION_TIER_SEC,
            durationSec * 2 + 180,
        );
    }

    if (fileSizeBytes > 0) {
        const sizeMb = fileSizeBytes / (1024 * 1024);
        return clamp(
            Math.round(sizeMb * 12),
            MIN_TOTAL_SIZE_TIER_SEC,
            MAX_TOTAL_SIZE_TIER_SEC,
        );
    }

    if (
        uploadTransferSec != null &&
        Number.isFinite(uploadTransferSec) &&
        uploadTransferSec > 0
    ) {
        return clamp(
            Math.round(uploadTransferSec * 2.5),
            MIN_TOTAL_TRANSFER_TIER_SEC,
            MAX_TOTAL_TRANSFER_TIER_SEC,
        );
    }

    return null;
}

/**
 * Apply monotonic total: never increase locked total when a better tier arrives.
 */
export function mergeProcessingTotalSec(
    locked: number | null,
    candidate: number | null,
): number | null {
    if (candidate == null) {
        return locked;
    }
    if (locked == null || candidate < locked) {
        return candidate;
    }
    return locked;
}

/**
 * Seconds remaining for footer countdown, or `null` to omit "N minutes left".
 */
export function estimateProcessingRemainingSec(
    input: ProcessingEtaInput,
    lockedTotalSec?: number | null,
): number | null {
    if (isTerminalUploadStatus(input.uploadStatus)) {
        return null;
    }

    const totalSec =
        lockedTotalSec ??
        estimateProcessingTotalSec({
            durationSec: input.durationSec,
            fileSizeBytes: input.fileSizeBytes,
            uploadTransferSec: input.uploadTransferSec,
            uploadStatus: input.uploadStatus,
        });

    if (totalSec == null) {
        return null;
    }

    const elapsed = Math.max(0, input.processingElapsedSec);
    const remainingSec = Math.max(0, totalSec - elapsed);
    return clamp(remainingSec, 0, MAX_DISPLAY_REMAINING_SEC);
}

/** Human label for processing ETA (feat-0029 footer). */
export function formatProcessingTimeLeft(seconds: number): string {
    if (seconds < LESS_THAN_MINUTE_THRESHOLD_SEC) {
        return 'Less than a minute left';
    }
    const mins = Math.max(1, Math.ceil(seconds / 60));
    return `${mins} minute${mins === 1 ? '' : 's'} left`;
}
