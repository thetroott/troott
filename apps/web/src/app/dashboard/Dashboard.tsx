import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import UploadLayout from '@/components/layouts/UploadLayout';
import { DraftProvider } from '@/context/draft/draftState';
import {
    UploadProvider,
    useUpload,
    uploadActions,
} from '@/context/upload/uploadState';
import FileUploadZone from '@/components/shared/upload/FileUploadZone';
import UploadModal from '@/components/shared/upload/UploadModal';
import useContextType from '@/hooks/shared/useContextType';
import { resolveMinisterId } from '@/utils/minister-id.util';
import {
    DEFAULT_MINISTER_LIST_PARAMS,
} from '@/constants/sermon-query-keys';
import {
    fetchSermonDetail,
    useMinisterSermonsQuery,
} from '@/hooks/app/useSermon';
import type { ISermonUpload } from '@/utils/interfaces.util.tsx';

const UploadContent: React.FC = () => {
    const { state, dispatch } = useUpload();
    const {
        currentStep,
        uploadComplete,
        uploadData,
        activeOption = 'upload',
    } = state;
    const location = useLocation();
    const { userContext } = useContextType();
    const user = userContext.user as Record<string, unknown> | null;
    const ministerId = useMemo(() => resolveMinisterId(user), [user]);

    const listParams = {
        ...DEFAULT_MINISTER_LIST_PARAMS,
        page: 1,
        limit: 50,
    };

    const { data: ministerSermonsRaw } = useMinisterSermonsQuery(
        ministerId,
        listParams,
        { enabled: Boolean(ministerId) },
    );

    const hasSermonsOnRecord =
        Array.isArray(ministerSermonsRaw) && ministerSermonsRaw.length > 0;
    const shouldOpenEntryModal = Boolean(
        (location.state as { openEntryModal?: boolean } | null)?.openEntryModal,
    );
    const useEntryModal =
        (Boolean(ministerId) && hasSermonsOnRecord) || shouldOpenEntryModal;

    useEffect(() => {
        const draftData = (location.state as { draftData?: unknown } | null)
            ?.draftData;
        if (draftData) {
            dispatch(
                uploadActions.loadFromDraft(
                    draftData as Partial<ISermonUpload>,
                ),
            );
            window.history.replaceState({}, document.title);
        }
    }, [dispatch, location]);

    useEffect(() => {
        const sid = (location.state as { resumeSermonId?: string } | null)
            ?.resumeSermonId;
        if (!sid) {
            return;
        }
        let cancelled = false;
        void (async () => {
            try {
                const body = await fetchSermonDetail(sid);
                const d = (body as { data?: Record<string, unknown> })?.data;
                if (cancelled || !d) {
                    return;
                }
                const tags = Array.isArray(d.tags)
                    ? (d.tags as unknown[]).map(String)
                    : [];
                dispatch(
                    uploadActions.loadFromDraft({
                        sermonId: sid,
                        title: String(d.title ?? ''),
                        description: String(d.description ?? ''),
                        tags,
                        category: String(d.topic ?? ''),
                        isPublic: d.isPublic !== false,
                    }),
                );
                const hasAudio = Boolean(
                    typeof d.sermonUrl === 'string' && d.sermonUrl,
                );
                dispatch(uploadActions.setUploadComplete(hasAudio));
                dispatch(
                    uploadActions.setStep(hasAudio ? 'review' : 'details'),
                );
                window.history.replaceState({}, document.title);
            } catch {
                if (!cancelled) {
                    toast.error('Could not load sermon for editing.');
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [dispatch, location.state]);

    const isModalOpen = currentStep !== 'file';

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            if (
                !uploadComplete &&
                (uploadData.file || uploadData.title || uploadData.description)
            ) {
                dispatch(uploadActions.clearStoredData());
            }

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

const Dashboard: React.FC = () => {
    return (
        <DraftProvider>
            <UploadProvider>
                <UploadContent />
            </UploadProvider>
        </DraftProvider>
    );
};

export default Dashboard;
