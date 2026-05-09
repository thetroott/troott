import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import UploadLayout from '@/components/layouts/UploadLayout';
import {
    UploadProvider,
    useUpload,
    uploadActions,
} from '@/context/upload/upload.context';
import FileUploadZone from '@/components/shared/upload/FileUploadZone';
import UploadModal from '@/components/shared/upload/UploadModal';
import apiCall from '@/api/config';
import { useContextType } from '@troott/state';
import { resolveMinisterId } from '@/utils/minister-id.util';
import {
    DEFAULT_MINISTER_LIST_PARAMS,
    sermonQueryKeys,
} from '@/constants/sermon-query-keys';
import { parseMinisterSermonsResponse } from '@/utils/sermon-list-map.util';
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

    const { data: ministerSermonsRaw } = useQuery({
        queryKey: sermonQueryKeys.ministerList(ministerId || 'unknown', {
            ...DEFAULT_MINISTER_LIST_PARAMS,
            page: 1,
            limit: 50,
        }),
        enabled: Boolean(ministerId),
        queryFn: async () => {
            const res = await apiCall.sermon.getSermonsByMinister(ministerId, {
                page: 1,
                limit: 50,
                sort: DEFAULT_MINISTER_LIST_PARAMS.sort,
            });
            const { list } = parseMinisterSermonsResponse(res);
            return list;
        },
    });

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
                const res = await apiCall.sermon.getSermonById(sid);
                const body = res.data as { data?: Record<string, unknown> };
                const d = body?.data;
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
        <UploadProvider>
            <UploadContent />
        </UploadProvider>
    );
};

export default Dashboard;
