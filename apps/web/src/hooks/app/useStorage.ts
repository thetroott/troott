import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { Asset } from '@/app/profile/profile.types';
import { uploadStorageFile } from '@/services/upload/storage-upload.service';

type UploadImageVars = {
    file: File | FormData;
    onProgress?: (percent: number) => void;
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
            const uploadTarget =
                file instanceof File
                    ? file
                    : (file.get('file') as File | null);
            if (!uploadTarget) {
                throw new Error('No file to upload');
            }
            const dto = await uploadStorageFile(uploadTarget, { onProgress });
            return {
                fileName: dto.fileName,
                s3Key: dto.s3Key,
                url: dto.url,
            };
        },
    });
}
