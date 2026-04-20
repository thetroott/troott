import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import UploadLayout from '@/components/layouts/UploadLayout';
import {
    UploadProvider,
    useUpload,
    uploadActions,
} from '@/context/upload/upload.context';
import FileUploadZone from '@/components/shared/upload/FileUploadZone';
import UploadModal from '@/components/shared/upload/UploadModal';
import apiCall from '@/api/config';
import { useUserStore } from '@/store/user-store';
import { resolveMinisterId } from '@/utils/minister-id.util';
import { sermonQueryKeys } from '@/constants/sermon-query-keys';

const UploadContent: React.FC = () => {
    const { state, dispatch } = useUpload();
    const {
        currentStep,
        uploadComplete,
        uploadData,
        activeOption = 'upload',
    } = state;
    const location = useLocation();
    const user = useUserStore((s) => s.user) as Record<string, unknown> | null;
    const ministerId = useMemo(() => resolveMinisterId(user), [user]);

    const { data: ministerSermonsRaw } = useQuery({
        queryKey: sermonQueryKeys.minister(ministerId || 'unknown'),
        enabled: Boolean(ministerId),
        queryFn: async () => {
            const res = await apiCall.sermon.getSermonsByMinister(ministerId, {
                page: 1,
                limit: 50,
            });
            const body = res.data as { data?: unknown };
            const raw = body?.data;
            if (Array.isArray(raw)) return raw;
            if (
                raw &&
                typeof raw === 'object' &&
                Array.isArray((raw as { sermons?: unknown }).sermons)
            ) {
                return (raw as { sermons: unknown[] }).sermons;
            }
            return [];
        },
    });

    const hasSermonsOnRecord =
        Array.isArray(ministerSermonsRaw) && ministerSermonsRaw.length > 0;
    const shouldOpenEntryModal = Boolean(
        (location.state as { openEntryModal?: boolean } | null)?.openEntryModal,
    );
    const useEntryModal =
        (Boolean(ministerId) && hasSermonsOnRecord) || shouldOpenEntryModal;

    // Load draft data if passed through navigation state
    useEffect(() => {
        const draftData = (location.state as any)?.draftData;
        if (draftData) {
            dispatch(uploadActions.loadFromDraft(draftData));
            // Clear the location state
            window.history.replaceState({}, document.title);
        }
    }, [dispatch, location]);

    // Modal is open when step is not 'file'
    const isModalOpen = currentStep !== 'file';

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            // Clear stored data when modal closes without completing upload
            if (
                !uploadComplete &&
                (uploadData.file || uploadData.title || uploadData.description)
            ) {
                dispatch(uploadActions.clearStoredData());
            }

            // When modal closes, reset to file step
            dispatch(uploadActions.setStep('file'));
        }
    };

    return (
        <UploadLayout feedHasSermons={useEntryModal}>
            {activeOption === 'upload' ? (
                <>
                    <FileUploadZone
                        useEntryModal={useEntryModal}
                        autoOpenEntryModal={shouldOpenEntryModal}
                    />
                    <UploadModal
                        open={isModalOpen}
                        onOpenChange={handleModalOpenChange}
                    />
                </>
            ) : (
                <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-semibold text-foreground">
                            Coming Soon
                        </h2>
                        <p className="text-muted-foreground">
                            This feature is currently under development and will
                            be available soon.
                        </p>
                    </div>
                </div>
            )}
        </UploadLayout>
    );
};

const UploadSermon: React.FC = () => {
    return (
        <UploadProvider>
            <UploadContent />
        </UploadProvider>
    );
};

export default UploadSermon;
