import { describe, it, expect } from '@jest/globals';
import {
    MediaStatus,
    UploadStatus,
} from '@/interfaces/core/sermon.interface';

describe('sermon upload model contract', () => {
    it('MediaStatus excludes legacy processing value', () => {
        expect(Object.values(MediaStatus)).not.toContain('processing');
        expect(MediaStatus.DRAFT).toBe('draft');
    });

    it('UploadStatus supports pipeline states on item subdoc', () => {
        expect(UploadStatus.UPLOADED).toBe('uploaded');
        expect(UploadStatus.PROCESSING).toBe('processing');
        expect(UploadStatus.COMPLETED).toBe('completed');
        expect(UploadStatus.FAILED).toBe('failed');
    });
});
