import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import api from '@/api/config';
import type { Asset } from '@/app/profile/profile.types';

type UploadImageVars = {
    file: File | FormData;
    onProgress?: (percent: number) => void;
};

type StorageUploadDto = {
    file?: string;
    s3Key?: string;
    fileName?: string;
};

/**
 * Multipart image upload via `api.storage.uploadImage`.
 */
export default function useUploadImageMutation(
    options?: Omit<
        UseMutationOptions<Asset, Error, UploadImageVars>,
        'mutationFn'
    >,
) {
    return useMutation({
        ...options,
        mutationFn: async ({ file, onProgress }) => {
            const res = await api.storage.uploadImage(file, onProgress);
            if (!res?.data || typeof res.data !== 'object') {
                throw new Error('Upload failed');
            }
            const envelope = res.data as { data?: unknown };
            const inner =
                envelope.data && typeof envelope.data === 'object'
                    ? envelope.data
                    : res.data;
            const dto = inner as StorageUploadDto;
            if (!dto?.s3Key) {
                throw new Error('Upload failed');
            }
            return {
                fileName: dto.fileName ?? '',
                s3Key: dto.s3Key,
                url: dto.file,
            };
        },
    });
}
