import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import UploadModal from '@/components/shared/upload/UploadModal';
import UploadEntryStepModal from '@/components/shared/upload/UploadEntryStepModal';
import { MySermonsEmptyShell } from '@/components/shared/my-sermons/MySermonsEmptyShell';
import { useUpload, uploadActions } from '@/context/upload/uploadState';
import storage from '@/api/services/local-storage';
import {
    PATH_SEG_SERMONS_UPLOAD_FILE,
    studioSermonsListPath,
    studioUploadPath,
} from '@/routes/paths';
import { fetchSermonDetail } from '@/hooks/app/useSermon';
import type { ISermonUpload } from '@/utils/interfaces.util.tsx';
import { applySelectedAudioToUpload } from '@/utils/upload-audio-selection.util';
import {
    uploadPathSegmentFromStep,
    uploadStepFromPathname,
    type UploadWizardStepKey,
} from '@/utils/upload-wizard-route.util';
import { resolveSermonPlaybackUrl } from '@/utils/sermon-list-map.util';
import { resolveSermonCoverUrl } from '@/services/upload/sermon-cover-upload.service';
import { toast } from 'sonner';

/** Full-page upload wizard at /studio/:studioCode/sermons/upload/... */
const SermonUploadPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { studioCode } = useParams<{ studioCode: string }>();
    const { state: uploadState, dispatch } = useUpload();
    const hasFile = Boolean(uploadState.uploadData.file);
    const skipEntryCloseBackRef = useRef(false);

    const resumeSermonId = (
        location.state as { resumeSermonId?: string } | null
    )?.resumeSermonId;

    const [entryOpen, setEntryOpen] = useState(
        () => !hasFile && !resumeSermonId,
    );
    const [wizardOpen, setWizardOpen] = useState(
        () => hasFile || Boolean(resumeSermonId),
    );

    const goBackFromUpload = useCallback(() => {
        const code =
            studioCode?.trim() || storage.getStudioCode()?.trim() || '';
        if (code) {
            navigate(studioSermonsListPath(code));
        }
    }, [navigate, studioCode]);

    const syncStepToUrl = useCallback(
        (step: string) => {
            const code =
                studioCode?.trim() || storage.getStudioCode()?.trim() || '';
            if (!code) {
                return;
            }
            const segment = uploadPathSegmentFromStep(step);
            const target = studioUploadPath(code, segment);
            if (!location.pathname.includes(segment)) {
                navigate(target, { replace: true });
            }
        },
        [location.pathname, navigate, studioCode],
    );

    const navigateToWizardStep = useCallback(
        (step: UploadWizardStepKey) => {
            const code =
                studioCode?.trim() || storage.getStudioCode()?.trim() || '';
            if (!code) {
                return;
            }
            navigate(
                studioUploadPath(code, uploadPathSegmentFromStep(step)),
                { replace: true },
            );
        },
        [navigate, studioCode],
    );

    useEffect(() => {
        if (!hasFile && !resumeSermonId) {
            setEntryOpen(true);
            setWizardOpen(false);
            if (uploadState.currentStep !== 'file') {
                dispatch(uploadActions.setStep('file'));
            }
            return;
        }
        setEntryOpen(false);
        setWizardOpen(true);
        const step = uploadStepFromPathname(location.pathname);
        if (uploadState.currentStep !== step) {
            dispatch(uploadActions.setStep(step));
        }
    }, [
        dispatch,
        hasFile,
        location.pathname,
        resumeSermonId,
        uploadState.currentStep,
    ]);

    useEffect(() => {
        const sid = resumeSermonId;
        if (!sid) {
            return;
        }
        let cancelled = false;
        void (async () => {
            try {
                const d = (await fetchSermonDetail(sid)) as
                    | Record<string, unknown>
                    | undefined;
                if (cancelled || !d || typeof d !== 'object') {
                    return;
                }
                const tags = Array.isArray(d.tags)
                    ? (d.tags as unknown[]).map(String)
                    : [];
                const coverUrl = resolveSermonCoverUrl(d);
                dispatch(
                    uploadActions.loadFromDraft({
                        sermonId: sid,
                        title: String(d.title ?? ''),
                        description: String(d.description ?? ''),
                        tags,
                        category: String(d.topic ?? ''),
                        isPublic: d.isPublic !== false,
                        thumbnailPreview: coverUrl,
                        coverImageUrl: coverUrl,
                        coverUploadStatus: coverUrl ? 'uploaded' : 'idle',
                        coverUploadError: null,
                        coverFileFingerprint: null,
                    } as Partial<ISermonUpload>),
                );
                const hasAudio = Boolean(resolveSermonPlaybackUrl(d));
                const resumeStep: UploadWizardStepKey = hasAudio
                    ? 'review'
                    : 'details';
                dispatch(uploadActions.setUploadComplete(hasAudio));
                dispatch(uploadActions.setStep(resumeStep));
                setEntryOpen(false);
                setWizardOpen(true);
                navigateToWizardStep(resumeStep);
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
    }, [dispatch, navigateToWizardStep, resumeSermonId]);

    const onFileSelected = useCallback(
        (file: File) => {
            skipEntryCloseBackRef.current = true;
            applySelectedAudioToUpload(dispatch, file);
            setEntryOpen(false);
            setWizardOpen(true);
            const step = uploadStepFromPathname(location.pathname);
            dispatch(
                uploadActions.setStep(
                    step === 'details' ||
                        step === 'settings' ||
                        step === 'review'
                        ? step
                        : 'progress',
                ),
            );
            const code =
                studioCode?.trim() || storage.getStudioCode()?.trim() || '';
            if (code && !location.pathname.includes(PATH_SEG_SERMONS_UPLOAD_FILE)) {
                navigate(
                    studioUploadPath(code, PATH_SEG_SERMONS_UPLOAD_FILE),
                    { replace: true },
                );
            }
        },
        [dispatch, location.pathname, navigate, studioCode],
    );

    const handleEntryOpenChange = useCallback(
        (open: boolean) => {
            setEntryOpen(open);
            if (!open) {
                if (skipEntryCloseBackRef.current) {
                    skipEntryCloseBackRef.current = false;
                    return;
                }
                if (!uploadState.uploadData.file) {
                    goBackFromUpload();
                }
            }
        },
        [goBackFromUpload, uploadState.uploadData.file],
    );

    const handleWizardOpenChange = useCallback(
        (open: boolean) => {
            setWizardOpen(open);
            if (!open) {
                if (!uploadState.uploadData.file) {
                    dispatch(uploadActions.setStep('file'));
                    setEntryOpen(true);
                } else {
                    goBackFromUpload();
                }
            }
        },
        [
            dispatch,
            goBackFromUpload,
            uploadState.uploadData.file,
        ],
    );

    return (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <MySermonsEmptyShell
                decorative
                className="absolute inset-0 min-h-full"
            />
            <UploadEntryStepModal
                open={entryOpen}
                onOpenChange={handleEntryOpenChange}
                isLoading={uploadState.isLoading}
                onFileSelected={onFileSelected}
            />
            {/* Centered dialog (same shell as entry modal) — not embedded in page flow */}
            <UploadModal
                open={wizardOpen}
                onOpenChange={handleWizardOpenChange}
                onStepChange={syncStepToUrl}
            />
        </div>
    );
};

export default SermonUploadPage;
