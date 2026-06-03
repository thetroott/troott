import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { sermonQueryKeys } from '@/constants/sermon-query-keys';
import {
    uploadSermonCoverForSermon,
    type SermonCoverUploadResult,
} from '@/services/upload/sermon-cover-upload.service';

export function useSermonCoverUpload(ministerId?: string) {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const inFlightRef = useRef(false);

    const uploadCover = useCallback(
        async (
            sermonId: string,
            file: File,
            onProgress?: (percent: number) => void,
        ): Promise<SermonCoverUploadResult> => {
            if (inFlightRef.current) {
                throw new Error('Cover upload already in progress');
            }
            inFlightRef.current = true;
            setIsUploading(true);
            try {
                const result = await uploadSermonCoverForSermon(
                    sermonId,
                    file,
                    onProgress,
                );
                await queryClient.invalidateQueries({
                    queryKey: sermonQueryKeys.all,
                });
                if (ministerId) {
                    await queryClient.invalidateQueries({
                        queryKey: sermonQueryKeys.ministerListRoot(ministerId),
                    });
                }
                return result;
            } finally {
                inFlightRef.current = false;
                setIsUploading(false);
            }
        },
        [ministerId, queryClient],
    );

    return { uploadCover, isUploading };
}
