import { describe, expect, it } from 'vitest';
import { UploadStatus } from '@/dtos/sermon-media.types';
import {
    estimateProcessingRemainingSec,
    estimateProcessingTotalSec,
    formatProcessingTimeLeft,
    isTerminalUploadStatus,
    mergeProcessingTotalSec,
    pickSermonDurationSec,
    pickSermonFileSizeBytes,
} from './upload-processing-eta.util';

describe('upload-processing-eta.util', () => {
    it('detects terminal upload statuses', () => {
        expect(isTerminalUploadStatus(UploadStatus.COMPLETED)).toBe(true);
        expect(isTerminalUploadStatus(UploadStatus.PROCESSING)).toBe(false);
    });

    it('picks duration from sermon detail', () => {
        expect(
            pickSermonDurationSec({ duration: 0, item: { duration: 300 } }),
        ).toBe(300);
        expect(pickSermonDurationSec({ duration: 120 })).toBe(120);
        expect(pickSermonDurationSec({})).toBe(0);
    });

    it('picks file size with local file precedence', () => {
        expect(
            pickSermonFileSizeBytes({ item: { size: 1000 } }, 5000),
        ).toBe(5000);
        expect(pickSermonFileSizeBytes({ item: { size: 1000 } })).toBe(1000);
    });

    it('tier A: duration-based total', () => {
        expect(
            estimateProcessingTotalSec({
                durationSec: 300,
                fileSizeBytes: 1e7,
                uploadTransferSec: 30,
                uploadStatus: UploadStatus.EXTRACTING,
            }),
        ).toBe(180);
    });

    it('tier B: size-based total when no duration', () => {
        const elevenMb = 11 * 1024 * 1024;
        expect(
            estimateProcessingTotalSec({
                durationSec: 0,
                fileSizeBytes: elevenMb,
                uploadTransferSec: null,
                uploadStatus: UploadStatus.UPLOADED,
            }),
        ).toBe(132);
    });

    it('tier D: no signal', () => {
        expect(
            estimateProcessingTotalSec({
                durationSec: 0,
                fileSizeBytes: 0,
                uploadTransferSec: null,
                uploadStatus: UploadStatus.UPLOADED,
            }),
        ).toBeNull();
    });

    it('terminal status returns null remaining', () => {
        expect(
            estimateProcessingRemainingSec({
                durationSec: 300,
                fileSizeBytes: 0,
                uploadTransferSec: null,
                processingElapsedSec: 10,
                uploadStatus: UploadStatus.COMPLETED,
            }),
        ).toBeNull();
    });

    it('remaining decreases with elapsed time', () => {
        const locked = 180;
        expect(
            estimateProcessingRemainingSec(
                {
                    durationSec: 300,
                    fileSizeBytes: 0,
                    uploadTransferSec: null,
                    processingElapsedSec: 60,
                    uploadStatus: UploadStatus.PROCESSING,
                },
                locked,
            ),
        ).toBe(120);
    });

    it('mergeProcessingTotalSec only shrinks locked total', () => {
        expect(mergeProcessingTotalSec(200, 150)).toBe(150);
        expect(mergeProcessingTotalSec(150, 200)).toBe(150);
        expect(mergeProcessingTotalSec(null, 120)).toBe(120);
    });

    it('formatProcessingTimeLeft for sub-minute', () => {
        expect(formatProcessingTimeLeft(15)).toBe('Less than a minute left');
        expect(formatProcessingTimeLeft(90)).toBe('2 minutes left');
    });
});
