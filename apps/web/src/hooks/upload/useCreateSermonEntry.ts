import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUpload } from '@/context/upload/uploadState';
import storage from '@/api/services/local-storage';
import {
    PATH_SEG_SERMONS_UPLOAD,
    studioUploadPath,
} from '@/routes/paths';
import { applySelectedAudioToUpload } from '@/utils/upload-audio-selection.util';
import {
    OPEN_CREATE_SERMON_STATE,
    readOpenCreateSermonFromState,
} from '@/constants/create-sermon-nav';

/**
 * My Sermons → Create sermon: audio entry modal, then upload wizard route.
 * Used for empty library, toolbar CTA, and first-time / Get Started entry (feat-0006).
 */
export function useCreateSermonEntry() {
    const navigate = useNavigate();
    const location = useLocation();
    const { dispatch, state: uploadState } = useUpload();
    const [entryModalOpen, setEntryModalOpen] = useState(false);

    useEffect(() => {
        if (readOpenCreateSermonFromState(location.state)) {
            setEntryModalOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname, location.state, navigate]);

    const openEntry = useCallback(() => {
        setEntryModalOpen(true);
    }, []);

    const onFileSelected = useCallback(
        (file: File) => {
            applySelectedAudioToUpload(dispatch, file);
            setEntryModalOpen(false);
            const code = storage.getStudioCode()?.trim();
            if (code) {
                navigate(studioUploadPath(code, PATH_SEG_SERMONS_UPLOAD));
            }
        },
        [dispatch, navigate],
    );

    const navigateToCreateSermon = useCallback(
        (studioCode: string) => {
            navigate(`/studio/${studioCode.trim().toLowerCase()}/sermons`, {
                state: { [OPEN_CREATE_SERMON_STATE]: true },
            });
        },
        [navigate],
    );

    /** Same entry as My Sermons → Create sermon (modal on sermons page). */
    const startUploadFlow = useCallback(() => {
        const code = storage.getStudioCode()?.trim();
        if (code) {
            navigateToCreateSermon(code);
        } else {
            openEntry();
        }
    }, [navigateToCreateSermon, openEntry]);

    return {
        entryModalOpen,
        setEntryModalOpen,
        openEntry,
        onFileSelected,
        navigateToCreateSermon,
        startUploadFlow,
        isLoading: uploadState.isLoading,
    };
}
