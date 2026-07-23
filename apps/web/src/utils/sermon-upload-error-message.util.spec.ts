import { describe, expect, it } from 'vitest';
import axios from 'axios';

import {
    SERMON_UPLOAD_ERROR_GENERIC,
    sermonUploadErrorMessage,
} from './sermon-upload-error-message.util';

describe('sermonUploadErrorMessage', () => {
    it('returns API message when present', () => {
        const err = new axios.AxiosError('Request failed');
        err.response = {
            status: 400,
            data: { message: 'Invalid audio type' },
            statusText: 'Bad Request',
            headers: {},
            config: {} as never,
        };
        expect(sermonUploadErrorMessage(err)).toBe('Invalid audio type');
    });

    it('maps 413 to size copy', () => {
        const err = new axios.AxiosError('Request failed');
        err.response = {
            status: 413,
            data: {},
            statusText: 'Payload Too Large',
            headers: {},
            config: {} as never,
        };
        expect(sermonUploadErrorMessage(err)).toBe(
            'File is too large for upload.',
        );
    });

    it('maps 401 to session copy', () => {
        const err = new axios.AxiosError('Request failed');
        err.response = {
            status: 401,
            data: {},
            statusText: 'Unauthorized',
            headers: {},
            config: {} as never,
        };
        expect(sermonUploadErrorMessage(err)).toBe(
            'Session expired. Sign in again, then retry.',
        );
    });

    it('maps 502 to API unavailable copy', () => {
        const err = new axios.AxiosError('Request failed');
        err.response = {
            status: 502,
            data: {},
            statusText: 'Bad Gateway',
            headers: {},
            config: {} as never,
        };
        expect(sermonUploadErrorMessage(err)).toBe(
            'Staging API unavailable. Try again shortly.',
        );
    });

    it('maps ERR_NETWORK', () => {
        const err = new axios.AxiosError('Network Error');
        err.code = 'ERR_NETWORK';
        expect(sermonUploadErrorMessage(err)).toBe(
            'Network error during upload. Check your connection and try again.',
        );
    });

    it('maps CORS / Failed to fetch style errors', () => {
        expect(
            sermonUploadErrorMessage(
                new Error('Failed to fetch'),
            ),
        ).toBe(
            'Upload blocked by storage configuration. Contact support.',
        );
        expect(
            sermonUploadErrorMessage(
                new Error('Not allowed by CORS'),
            ),
        ).toBe(
            'Upload blocked by API CORS configuration. Contact support.',
        );
    });

    it('falls back to generic Progress copy', () => {
        expect(sermonUploadErrorMessage(null)).toBe(SERMON_UPLOAD_ERROR_GENERIC);
        expect(sermonUploadErrorMessage({})).toBe(SERMON_UPLOAD_ERROR_GENERIC);
    });
});
