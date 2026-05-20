import { useMutation } from '@tanstack/react-query';
import api from '../../api';

export function useUploadFileMutation() {
    return useMutation({
        mutationFn: (formData: FormData) => api.storage.upload(formData),
    });
}

export const useStorage = () => ({
    useUploadFileMutation,
});
