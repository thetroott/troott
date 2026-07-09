import { useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import type { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { sermonQueryKeys } from '@/constants/sermon-query-keys';
import { uploadActions } from '@/context/upload/uploadState';
import type { UploadDispatch } from '@/context/upload/types';
import { startSermonAudioUpload } from '@/services/upload/sermon-upload.service';
import {
    buildSermonUploadFileSignature,
    shouldSkipSermonUploadStart,
} from '@/utils/sermon-upload-file-signature.util';

export type UseStudioSermonAudioUploadParams = {
    file: File | null | undefined;
    fileSignature: string | null;
    uploadComplete: boolean;
    uploadError: boolean;
    retryToken: number;
    dispatch: UploadDispatch;
    queryClient: QueryClient;
    ministerId: string;
    onUploadError: () => void;
};

/**
 * feat-0008: exactly one in-flight `POST /sermon/start-upload` per file signature.
 */
export function useStudioSermonAudioUpload({
    file,
    fileSignature,
    uploadComplete,
    uploadError,
    retryToken,
    dispatch,
    queryClient,
    ministerId,
    onUploadError,
}: UseStudioSermonAudioUploadParams): { clearUploadFlight: () => void } {
    const startedForSignatureRef = useRef<string | null>(null);
    const queryClientRef = useRef(queryClient);
    queryClientRef.current = queryClient;
    const ministerIdRef = useRef(ministerId);
    ministerIdRef.current = ministerId;
    const dispatchRef = useRef(dispatch);
    dispatchRef.current = dispatch;
    const onUploadErrorRef = useRef(onUploadError);
    onUploadErrorRef.current = onUploadError;
    const fileRef = useRef(file);
    fileRef.current = file;
    const lastProgressPctRef = useRef(-1);

    const clearUploadFlight = useCallback(() => {
        startedForSignatureRef.current = null;
        lastProgressPctRef.current = -1;
    }, []);

    useEffect(() => {
        if (!fileSignature) {
            startedForSignatureRef.current = null;
            lastProgressPctRef.current = -1;
        }
    }, [fileSignature]);

    useEffect(() => {
        if (
            shouldSkipSermonUploadStart({
                fileSignature,
                uploadComplete,
                uploadError,
                startedForSignature: startedForSignatureRef.current,
            }) ||
            !fileRef.current
        ) {
            return;
        }

        const activeFile = fileRef.current;
        const signature =
            fileSignature ?? buildSermonUploadFileSignature(activeFile);
        startedForSignatureRef.current = signature;
        lastProgressPctRef.current = -1;

        const ac = new AbortController();
        let cancelled = false;

        dispatchRef.current(uploadActions.setLoading(true));
        dispatchRef.current(uploadActions.setProgress(0));

        void (async () => {
            try {
                const result = await startSermonAudioUpload({
                    file: activeFile,
                    onProgress: (pct: number) => {
                        if (cancelled) {
                            return;
                        }
                        const rounded = Math.min(100, Math.round(pct));
                        if (rounded === lastProgressPctRef.current) {
                            return;
                        }
                        lastProgressPctRef.current = rounded;
                        dispatchRef.current(uploadActions.setProgress(rounded));
                    },
                    signal: ac.signal,
                });

                if (cancelled) {
                    return;
                }

                dispatchRef.current(
                    uploadActions.setUploadData({
                        sermonId: result.sermonId,
                        uploadRef: result.uploadRef,
                    }),
                );
                dispatchRef.current(uploadActions.setUploadComplete(true));
                dispatchRef.current(uploadActions.setProgress(100));
                const ownerId = ministerIdRef.current;
                void queryClientRef.current.invalidateQueries({
                    queryKey: sermonQueryKeys.all,
                });
                if (ownerId) {
                    void queryClientRef.current.invalidateQueries({
                        queryKey: sermonQueryKeys.ministerListRoot(ownerId),
                    });
                }
            } catch (e: unknown) {
                if (cancelled || axios.isCancel(e)) {
                    return;
                }
                startedForSignatureRef.current = null;
                lastProgressPctRef.current = -1;
                const message =
                    e &&
                    typeof e === 'object' &&
                    'message' in e &&
                    typeof (e as { message: unknown }).message === 'string'
                        ? (e as { message: string }).message
                        : 'Upload failed. Please try again.';
                toast.error(message);
                onUploadErrorRef.current();
                dispatchRef.current(uploadActions.setProgress(0));
                dispatchRef.current(uploadActions.setUploadComplete(false));
            } finally {
                if (!cancelled) {
                    dispatchRef.current(uploadActions.setLoading(false));
                }
            }
        })();

        return () => {
            cancelled = true;
            ac.abort();
            if (startedForSignatureRef.current === signature) {
                startedForSignatureRef.current = null;
            }
        };
        // feat-0008: stable deps only — progress ticks must not restart start-upload.
    }, [fileSignature, uploadComplete, uploadError, retryToken]);

    return { clearUploadFlight };
}
