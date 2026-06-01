import type { AxiosResponse } from 'axios';

import api from '@/api/config';

export type StartSermonAudioUploadParams = {
    formData: FormData;
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
};

export type StartSermonAudioUploadResult = {
    sermonId: string;
    uploadRef?: string;
};

/**
 * Single network entry for minister sermon audio multipart upload.
 * Parses the same envelope as the upload UI (`data.id`, `data.uploadRef`).
 */
export async function startSermonAudioUpload(
    params: StartSermonAudioUploadParams,
): Promise<StartSermonAudioUploadResult> {
    const { formData, onProgress, signal } = params;
    const res = (await api.sermon.startUpload(
        formData,
        onProgress,
        signal,
    )) as AxiosResponse<{
        data?: {
            id?: string;
            uploadRef?: string;
            item?: { itemId?: string };
        };
    }>;

    const payload = res.data?.data as
        | { id?: string; uploadRef?: string; item?: { itemId?: string } }
        | undefined;

    if (!payload?.id) {
        throw new Error('Upload response did not include a sermon id.');
    }

    const uploadRef =
        payload.uploadRef?.trim() ||
        payload.item?.itemId?.trim() ||
        undefined;

    return { sermonId: payload.id, uploadRef };
}
