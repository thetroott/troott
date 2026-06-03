import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import UploadLayout from '@/components/layouts/UploadLayout';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import {
    useUpload,
    uploadActions,
} from '@/context/upload/uploadState';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import { readOpenCreateSermonFromState } from '@/constants/create-sermon-nav';
import {
    PATH_SEG_SERMONS_UPLOAD,
    studioUploadPath,
} from '@/routes/paths';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';
import storage from '@/api/services/local-storage';
import {
    DEFAULT_MINISTER_LIST_PARAMS,
} from '@/constants/sermon-query-keys';
import { useMinisterSermonsQuery } from '@/hooks/app/useSermon';
import { useCreateSermonEntry } from '@/hooks/upload/useCreateSermonEntry';
import type { ISermonUpload } from '@/utils/interfaces.util.tsx';
import { isTourLaunchPending } from '@/components/shared/tour/tour-steps';

const Dashboard: React.FC = () => {
    const { state, dispatch } = useUpload();
    const { activeOption = 'upload' } = state;
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { userContext } = useContextType();
    const { ministerId: contextMinisterId } = useMinister();
    const { creatorId } = useCreator();
    const user = userContext.user as Record<string, unknown> | null;
    const ministerId = useMemo(
        () => resolveStudioSermonOwnerId(user, contextMinisterId, creatorId),
        [user, contextMinisterId, creatorId],
    );
    const { startUploadFlow } = useCreateSermonEntry();

    const listParams = {
        ...DEFAULT_MINISTER_LIST_PARAMS,
        page: 1,
        limit: 50,
    };

    const { data: ministerSermonsRaw, isSuccess: sermonsLoaded } =
        useMinisterSermonsQuery(ministerId, listParams, {
            enabled: Boolean(ministerId),
        });

    const hasSermonsOnRecord =
        Array.isArray(ministerSermonsRaw) && ministerSermonsRaw.length > 0;

    useEffect(() => {
        if (readOpenCreateSermonFromState(location.state)) {
            startUploadFlow();
            return;
        }
        const resumeId = (location.state as { resumeSermonId?: string } | null)
            ?.resumeSermonId;
        const draftData = (location.state as { draftData?: unknown } | null)
            ?.draftData;
        if (resumeId || draftData) {
            return;
        }
        if (isTourLaunchPending(searchParams.get('tour'))) {
            return;
        }
    }, [location.state, searchParams, startUploadFlow]);

    useEffect(() => {
        const draftData = (location.state as { draftData?: unknown } | null)
            ?.draftData;
        if (!draftData) {
            return;
        }
        dispatch(
            uploadActions.loadFromDraft(
                draftData as Partial<ISermonUpload>,
            ),
        );
        const code = storage.getStudioCode()?.trim();
        if (code) {
            navigate(studioUploadPath(code, PATH_SEG_SERMONS_UPLOAD));
        }
        window.history.replaceState({}, document.title);
    }, [dispatch, location.state, navigate]);

    useEffect(() => {
        const sid = (location.state as { resumeSermonId?: string } | null)
            ?.resumeSermonId;
        if (!sid) {
            return;
        }
        const code = storage.getStudioCode()?.trim();
        if (code) {
            navigate(studioUploadPath(code, PATH_SEG_SERMONS_UPLOAD), {
                state: { resumeSermonId: sid },
            });
        }
    }, [location.state, navigate]);

    return (
        <UploadLayout
            feedHasSermons={sermonsLoaded && hasSermonsOnRecord}
        >
            {activeOption === 'upload' ? (
                <StudioEmptyState
                    placement="region"
                    wideDescription
                    description={
                        <>
                            Use{' '}
                            <span className="font-medium text-foreground">
                                Upload from computer
                            </span>{' '}
                            above, or open{' '}
                            <span className="font-medium text-foreground">
                                Sermons
                            </span>{' '}
                            and choose Create sermon — both use the same upload
                            experience.
                        </>
                    }
                    className="min-h-[min(50vh,400px)] text-muted-foreground"
                />
            ) : (
                <StudioEmptyState
                    placement="region"
                    title="Coming Soon"
                    className="min-h-[min(40vh,320px)]"
                    description="This feature is currently under development and will be available soon."
                />
            )}
        </UploadLayout>
    );
};

export default Dashboard;
