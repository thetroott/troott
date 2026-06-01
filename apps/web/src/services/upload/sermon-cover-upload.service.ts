import type { AxiosResponse } from 'axios';

import api from '@/api/config';

/**
 * Upload sermon cover image and attach to an existing sermon row.
 * Expects multipart field `file` and `sermonId` (API attaches when present).
 */
export async function uploadSermonCoverForSermon(
    sermonId: string,
    file: File,
    onProgress?: (percent: number) => void,
): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sermonId', sermonId);
    const res = (await api.sermon.uploadCover(
        formData,
        onProgress,
    )) as AxiosResponse<{
        data?: { error?: boolean; message?: string };
        error?: boolean;
        message?: string;
    }>;
    const envelope = res.data?.data ?? res.data;
    if (
        envelope &&
        typeof envelope === 'object' &&
        'error' in envelope &&
        envelope.error
    ) {
        throw new Error(
            typeof envelope.message === 'string'
                ? envelope.message
                : 'Cover upload failed',
        );
    }
}
