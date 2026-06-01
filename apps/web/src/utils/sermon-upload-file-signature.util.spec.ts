import { describe, expect, it } from 'vitest';

import {
    buildSermonUploadFileSignature,
    shouldSkipSermonUploadStart,
} from './sermon-upload-file-signature.util';

describe('sermon-upload-file-signature (feat-0008)', () => {
    it('buildSermonUploadFileSignature is stable for the same file metadata', () => {
        const file = new File(['a'], 'sermon.mp3', {
            type: 'audio/mpeg',
            lastModified: 1_700_000_000_000,
        });
        expect(buildSermonUploadFileSignature(file)).toBe(
            'sermon.mp3|1|1700000000000',
        );
    });

    it('shouldSkipSermonUploadStart when upload already started for signature', () => {
        expect(
            shouldSkipSermonUploadStart({
                fileSignature: 'a.mp3|1|2',
                uploadComplete: false,
                uploadError: false,
                startedForSignature: 'a.mp3|1|2',
            }),
        ).toBe(true);
    });

    it('shouldSkipSermonUploadStart when upload complete or errored', () => {
        expect(
            shouldSkipSermonUploadStart({
                fileSignature: 'a.mp3|1|2',
                uploadComplete: true,
                uploadError: false,
                startedForSignature: null,
            }),
        ).toBe(true);
        expect(
            shouldSkipSermonUploadStart({
                fileSignature: 'a.mp3|1|2',
                uploadComplete: false,
                uploadError: true,
                startedForSignature: null,
            }),
        ).toBe(true);
    });

    it('shouldSkipSermonUploadStart allows start for new signature', () => {
        expect(
            shouldSkipSermonUploadStart({
                fileSignature: 'b.mp3|2|3',
                uploadComplete: false,
                uploadError: false,
                startedForSignature: 'a.mp3|1|2',
            }),
        ).toBe(false);
    });
});
