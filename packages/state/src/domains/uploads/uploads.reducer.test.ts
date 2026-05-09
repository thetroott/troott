import { describe, expect, it } from 'vitest';
import { uploadsReducer } from './uploads.reducer';
import { uploadsInitial } from './uploads.seed';

describe('uploadsReducer', () => {
    it('registers, patches, completes upload', () => {
        const r1 = uploadsReducer(uploadsInitial, {
            type: 'REGISTER_UPLOAD',
            payload: {
                id: 'u1',
                record: {
                    fileName: 'a.mp3',
                    bytesTotal: 100,
                    bytesUploaded: 0,
                    uploadState: 'uploading',
                    processingStatus: null,
                    failedStage: null,
                    retries: 0,
                },
            },
        });
        expect(r1.inFlight.u1?.bytesUploaded).toBe(0);

        const r2 = uploadsReducer(r1, {
            type: 'PATCH_UPLOAD',
            payload: { id: 'u1', patch: { bytesUploaded: 50 } },
        });
        expect(r2.inFlight.u1?.bytesUploaded).toBe(50);

        const r3 = uploadsReducer(r2, {
            type: 'COMPLETE_UPLOAD',
            payload: { id: 'u1' },
        });
        expect(r3.inFlight.u1).toBeUndefined();
        expect(r3.completedIds).toContain('u1');
    });
});
