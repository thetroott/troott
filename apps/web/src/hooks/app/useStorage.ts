import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import api from '@/api/config';

type UploadImageVars = {
    file: File | FormData;
    onProgress?: (percent: number) => void;
};

/**
 * Multipart image upload via `api.storage.uploadImage` (same path as ImageUploadTile).
 */
export default function useUploadImageMutation(
    options?: Omit<
        UseMutationOptions<unknown, Error, UploadImageVars>,
        'mutationFn'
    >,
) {
    return useMutation({
        ...options,
        mutationFn: async ({ file, onProgress }) => {
            const res = await api.storage.uploadImage(file, onProgress);
            return res.data;
        },
    });
}
