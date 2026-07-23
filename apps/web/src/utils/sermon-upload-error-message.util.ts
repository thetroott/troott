/**
 * feat-0038: map upload failures to actionable Progress / toast copy.
 * @see specs/web/feature/feat-0038/TECH.md §5.2
 */
import axios from 'axios';

const GENERIC =
    'Something went wrong while uploading. You can retry without selecting the file again.';

function looksLikeCors(message: string): boolean {
    const m = message.toLowerCase();
    return (
        m.includes('cors') ||
        m.includes('cross-origin') ||
        m.includes('blocked by cors') ||
        m.includes('access-control-allow-origin') ||
        m.includes('failed to fetch') ||
        m.includes('networkerror when attempting to fetch')
    );
}

function looksLikeStorageBlocked(message: string): boolean {
    const m = message.toLowerCase();
    return (
        looksLikeCors(message) ||
        m.includes('amazonaws.com') ||
        m.includes('s3.') ||
        m.includes('presign') ||
        m.includes('etag')
    );
}

/**
 * Human-readable message for sermon audio upload failures (Uppy or legacy).
 */
export function sermonUploadErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
            const trimmed = apiMessage.trim();
            if (looksLikeCors(trimmed)) {
                return 'Upload blocked by storage or API configuration. Contact support.';
            }
            return trimmed;
        }
        if (status === 413) {
            return 'File is too large for upload.';
        }
        if (status === 401 || status === 403) {
            return 'Session expired. Sign in again, then retry.';
        }
        if (status === 502 || status === 503 || status === 504) {
            return 'Staging API unavailable. Try again shortly.';
        }
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            return 'Network error during upload. Check your connection and try again.';
        }
        if (error.message && looksLikeStorageBlocked(error.message)) {
            return 'Upload blocked by storage configuration. Contact support.';
        }
        if (error.message?.trim()) {
            return error.message.trim();
        }
    }

    if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
    ) {
        const message = (error as { message: string }).message.trim();
        if (!message) {
            return GENERIC;
        }
        if (/not allowed by cors/i.test(message)) {
            return 'Upload blocked by API CORS configuration. Contact support.';
        }
        if (looksLikeStorageBlocked(message)) {
            return 'Upload blocked by storage configuration. Contact support.';
        }
        return message;
    }

    if (typeof error === 'string' && error.trim()) {
        return error.trim();
    }

    return GENERIC;
}

export const SERMON_UPLOAD_ERROR_GENERIC = GENERIC;
