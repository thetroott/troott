import type { AxiosResponse } from 'axios';

import api from '@/api/config';
import { sermonQueryKeys } from '@/constants/sermon-query-keys';

export function coverFileFingerprint(file: File): string {
    return `${file.name}:${file.size}:${file.lastModified}`;
}

export function resolveSermonCoverUrl(
    doc: Record<string, unknown>,
): string | null {
    const imageUrl =
        typeof doc.imageUrl === 'string' ? doc.imageUrl.trim() : '';
    return imageUrl || null;
}

export type SermonCoverUploadResult = {
    imageUrl: string;
};

/**
 * Upload sermon cover image and attach to an existing sermon row.
 * Expects multipart field `file` and `sermonId` (API attaches when present).
 */
export async function uploadSermonCoverForSermon(
    sermonId: string,
    file: File,
    onProgress?: (percent: number) => void,
): Promise<SermonCoverUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sermonId', sermonId);
    const res = (await api.sermon.uploadCover(
        formData,
        onProgress,
    )) as AxiosResponse<{
        data?: { error?: boolean; message?: string } | Record<string, unknown>;
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
    const sermon =
        envelope && typeof envelope === 'object'
            ? (envelope as Record<string, unknown>)
            : null;
    const imageUrl = sermon ? resolveSermonCoverUrl(sermon) : null;
    if (!imageUrl) {
        throw new Error('Cover upload succeeded but no image URL returned');
    }
    return { imageUrl };
}
