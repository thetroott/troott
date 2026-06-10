import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Loader2, X } from 'lucide-react';
import { useUpload, uploadActions } from '@/context/upload/uploadState';
import {
    UPLOAD_SHELL,
    UPLOAD_STEP_TABS,
} from '@/components/shared/upload/upload-studio-ui';
import UploadProgressStep from './UploadProgressStep';
import SermonDetailsForm from './SermonDetailsForm';
import ListenerSettings from './ListenerSettings';
import ReviewSubmit from './ReviewSubmit';
import { useSermonByIdQuery } from '@/hooks/app/useSermon';
import { formatUploadPipelineLabel } from '@/utils/upload-pipeline-label.util';
import {
    estimateProcessingRemainingSec,
    estimateProcessingTotalSec,
    formatProcessingTimeLeft,
    mergeProcessingTotalSec,
    pickSermonDurationSec,
    pickSermonFileSizeBytes,
} from '@/utils/upload-processing-eta.util';
import { UploadStatus } from '@/dtos/sermon-media.types';

interface UploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full-page studio route: render wizard in layout instead of a portaled dialog. */
    embedded?: boolean;
    /** Sync wizard tab to `/studio/:code/sermons/upload/…` segment (feat-0018). */
    onStepChange?: (step: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
    open,
    onOpenChange,
    embedded = false,
    onStepChange,
}) => {
    const { state, dispatch } = useUpload();
    const { currentStep, uploadData, uploadComplete, progress, isLoading } =
        state;
    const reviewSubmitRef = useRef<(() => void) | null>(null);
    const saveDraftRef = useRef<(() => Promise<void>) | null>(null);
    const uploadStartAtRef = useRef<number | null>(null);
    const uploadDurationSecRef = useRef<number | null>(null);
    const uploadCompleteAtRef = useRef<number | null>(null);
    const processingStartAtRef = useRef<number | null>(null);
    const processingTotalSecRef = useRef<number | null>(null);
    const [etaNowMs, setEtaNowMs] = useState<number>(() => Date.now());
    const [uploadTransferSec, setUploadTransferSec] = useState<number | null>(
        null,
    );
    const [pollOwnerId] = useState<string>('UploadModal');

    const hasUploadFile = Boolean(uploadData.file);
    /** Multipart in flight or waiting on `start-upload` response (includes 100% finalizing). */
    const uploadInFlight =
        hasUploadFile && !uploadComplete && isLoading;
    /** Bytes still transferring (footer “Uploading N%”). */
    const isTransferring =
        uploadInFlight && progress > 0 && progress < 100;
    const uploadBusyOnServer = uploadInFlight;
    const showFinalizingUpload =
        Boolean(uploadData.file) &&
        !uploadComplete &&
        isLoading &&
        progress >= 100;
    /**
     * Figma [`4535:21468`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4535-21468) / [`4499:19755`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4499-19755).
     * Glyphs [`4535:21568`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4535-21568), [`6147:67799`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6147-67799) — show on **every** wizard step once a file exists (including **Uploads**), not only Details/Listener.
     */
    const showFooterUploadStatus =
        Boolean(uploadData.file) &&
        (currentStep === 'progress' ||
            currentStep === 'details' ||
            currentStep === 'settings' ||
            currentStep === 'review');

    const sermonIdForPipeline =
        uploadData.sermonId && uploadData.sermonId.trim().length > 0
            ? uploadData.sermonId.trim()
            : undefined;
    const {
        data: uploadedSermonDetail,
        dataUpdatedAt: statusDataUpdatedAt,
    } = useSermonByIdQuery(
        sermonIdForPipeline,
        {
            enabled: Boolean(sermonIdForPipeline),
            staleTime: 0,
            refetchOnMount: 'always',
            refetchOnReconnect: true,
            refetchOnWindowFocus: (query) => {
                const item = (
                    query.state.data as
                        | { item?: { uploadStatus?: string } }
                        | undefined
                )?.item;
                const status = item?.uploadStatus;
                if (
                    status === UploadStatus.COMPLETED ||
                    status === UploadStatus.FAILED ||
                    status === UploadStatus.CANCELLED
                ) {
                    return false;
                }
                return true;
            },
            refetchInterval: (query) => {
                const item = (
                    query.state.data as
                        | { item?: { uploadStatus?: string } }
                        | undefined
                )?.item;
                const status = item?.uploadStatus;
                if (
                    status === UploadStatus.COMPLETED ||
                    status === UploadStatus.FAILED ||
                    status === UploadStatus.CANCELLED
                ) {
                    return false;
                }
                const elapsedSinceUploadCompleteMs =
                    uploadCompleteAtRef.current != null
                        ? Date.now() - uploadCompleteAtRef.current
                        : 0;
                if (elapsedSinceUploadCompleteMs >= 60 * 60 * 1000) {
                    return 15000;
                }
                if (elapsedSinceUploadCompleteMs >= 30 * 60 * 1000) {
                    return 10000;
                }
                return 4000;
            },
        },
    );
    const serverUploadStatus = (
        uploadedSermonDetail as
            | { item?: { uploadStatus?: string } }
            | undefined
    )?.item?.uploadStatus;
    const pipelineLabel = formatUploadPipelineLabel(serverUploadStatus);
    const isServerTerminal =
        serverUploadStatus === UploadStatus.COMPLETED ||
        serverUploadStatus === UploadStatus.FAILED ||
        serverUploadStatus === UploadStatus.CANCELLED;
    const elapsedSinceUploadCompleteMs =
        uploadCompleteAtRef.current != null
            ? Math.max(0, etaNowMs - uploadCompleteAtRef.current)
            : 0;
    const isStallWarn = elapsedSinceUploadCompleteMs >= 30 * 60 * 1000;
    const isStallError = elapsedSinceUploadCompleteMs >= 60 * 60 * 1000;
    const statusStalenessMs =
        statusDataUpdatedAt > 0 ? Math.max(0, etaNowMs - statusDataUpdatedAt) : 0;
    const isProcessingActive =
        hasUploadFile &&
        !isTransferring &&
        (showFinalizingUpload ||
            (uploadComplete && !isServerTerminal) ||
            (!uploadComplete && !isLoading));

    const formatMinutesLeft = (seconds: number): string => {
        const mins = Math.max(1, Math.ceil(seconds / 60));
        return `${mins} minute${mins === 1 ? '' : 's'} left`;
    };

    useEffect(() => {
        if (isTransferring && uploadStartAtRef.current == null) {
            uploadStartAtRef.current = Date.now();
        }
        if (!uploadInFlight) {
            uploadStartAtRef.current = null;
        }
    }, [isTransferring, uploadInFlight]);

    useEffect(() => {
        if (
            uploadComplete &&
            uploadStartAtRef.current != null &&
            uploadDurationSecRef.current == null
        ) {
            const sec = Math.max(
                1,
                (Date.now() - uploadStartAtRef.current) / 1000,
            );
            uploadDurationSecRef.current = sec;
            setUploadTransferSec(sec);
        }
        if (!hasUploadFile) {
            uploadDurationSecRef.current = null;
            setUploadTransferSec(null);
        }
    }, [uploadComplete, hasUploadFile]);

    useEffect(() => {
        if (uploadComplete && uploadCompleteAtRef.current == null) {
            uploadCompleteAtRef.current = Date.now();
        }
        if (!hasUploadFile) {
            uploadCompleteAtRef.current = null;
        }
    }, [uploadComplete, hasUploadFile]);

    useEffect(() => {
        if (isProcessingActive && processingStartAtRef.current == null) {
            processingStartAtRef.current = Date.now();
        }
        if (!isProcessingActive) {
            processingStartAtRef.current = null;
            processingTotalSecRef.current = null;
        }
    }, [isProcessingActive]);

    const durationSec = pickSermonDurationSec(uploadedSermonDetail);
    const fileSizeBytes = pickSermonFileSizeBytes(
        uploadedSermonDetail,
        uploadData.file?.size,
    );

    const processingTotalSec = useMemo(() => {
        if (!isProcessingActive) {
            return null;
        }
        const candidate = estimateProcessingTotalSec({
            durationSec,
            fileSizeBytes,
            uploadTransferSec,
            uploadStatus: serverUploadStatus,
        });
        const merged = mergeProcessingTotalSec(
            processingTotalSecRef.current,
            candidate,
        );
        processingTotalSecRef.current = merged;
        return merged;
    }, [
        isProcessingActive,
        durationSec,
        fileSizeBytes,
        uploadTransferSec,
        serverUploadStatus,
    ]);

    useEffect(() => {
        if (!(isTransferring || isProcessingActive)) {
            return;
        }
        const timer = setInterval(() => {
            setEtaNowMs(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, [isTransferring, isProcessingActive]);

    useEffect(() => {
        if (!sermonIdForPipeline || !isProcessingActive) {
            return;
        }
        const detail = {
            event: 'upload-status-poll-heartbeat',
            owner: pollOwnerId,
            sermonId: sermonIdForPipeline,
            uploadStatus: serverUploadStatus ?? null,
            elapsedSinceUploadCompleteMs,
            statusStalenessMs,
            isDuplicateOwner: false,
        };
        window.dispatchEvent(
            new CustomEvent('upload-status-poll-telemetry', {
                detail,
            }),
        );
    }, [
        sermonIdForPipeline,
        pollOwnerId,
        isProcessingActive,
        serverUploadStatus,
        elapsedSinceUploadCompleteMs,
        statusStalenessMs,
    ]);

    const uploadEtaLabel = useMemo(() => {
        if (!isTransferring || !uploadStartAtRef.current) {
            return null;
        }
        const elapsedSec = (etaNowMs - uploadStartAtRef.current) / 1000;
        if (elapsedSec <= 1 || progress <= 1) {
            return 'calculating…';
        }
        const pctPerSec = progress / elapsedSec;
        if (!Number.isFinite(pctPerSec) || pctPerSec <= 0) {
            return 'calculating…';
        }
        const remainingSec = Math.max(1, Math.round((100 - progress) / pctPerSec));
        return formatMinutesLeft(remainingSec);
    }, [isTransferring, progress, etaNowMs]);

    const processingEtaLabel = useMemo(() => {
        if (
            !isProcessingActive ||
            processingStartAtRef.current == null ||
            isStallError
        ) {
            return null;
        }
        const processingElapsedSec =
            (etaNowMs - processingStartAtRef.current) / 1000;
        const remainingSec = estimateProcessingRemainingSec(
            {
                durationSec,
                fileSizeBytes,
                uploadTransferSec,
                processingElapsedSec,
                uploadStatus: serverUploadStatus,
            },
            processingTotalSec,
        );
        if (remainingSec == null) {
            return null;
        }
        return formatProcessingTimeLeft(remainingSec);
    }, [
        isProcessingActive,
        isStallError,
        etaNowMs,
        durationSec,
        fileSizeBytes,
        uploadTransferSec,
        serverUploadStatus,
        processingTotalSec,
    ]);

    // Removed auto-switch to details after upload completes
    // Users can manually navigate to any tab they want after upload completes

    // Step configuration
    const steps = [
        { key: 'progress', label: 'Upload Progress', completed: false },
        { key: 'details', label: 'Details', completed: false },
        { key: 'settings', label: 'Listener Settings', completed: false },
        { key: 'review', label: 'Review & Submit', completed: false },
    ];

    // Update step completion status
    const updatedSteps = steps.map((step) => ({
        ...step,
        completed:
            (step.key === 'progress' && uploadData.file && uploadComplete) ||
            (step.key === 'details' &&
                uploadData.title?.trim() &&
                uploadData.description?.trim() &&
                uploadData.category?.trim()) ||
            (step.key === 'settings' && uploadData.isPublic !== undefined) || // Only completed when user has made a choice
            (step.key === 'review' &&
                uploadData.title?.trim() &&
                uploadData.description?.trim() &&
                uploadData.category?.trim() &&
                uploadComplete),
    }));

    const currentStepIndex = updatedSteps.findIndex(
        (step) => step.key === currentStep,
    );

    const goToStep = (stepKey: string) => {
        dispatch(uploadActions.setStep(stepKey));
        if (
            stepKey === 'progress' ||
            stepKey === 'details' ||
            stepKey === 'settings' ||
            stepKey === 'review'
        ) {
            onStepChange?.(stepKey);
        }
    };

    const handleStepClick = (stepKey: string) => {
        // Once a file is in the wizard, all tabs stay reachable during upload,
        // finalizing, and backend processing (feat-0006/0007).
        if (!hasUploadFile) {
            if (stepKey === 'progress') {
                goToStep(stepKey);
            }
            return;
        }
        goToStep(stepKey);
    };

    const handleNext = () => {
        if (!canProceed()) {
            return; // Don't proceed if current step is not valid
        }

        const nextStepIndex = currentStepIndex + 1;
        const nextStep = updatedSteps[nextStepIndex];
        if (nextStep) {
            goToStep(nextStep.key);
        }
    };

    const handleClose = async () => {
        const canSaveDraft =
            uploadData.sermonId ||
            uploadData.draftId ||
            uploadData.file ||
            uploadData.title ||
            uploadData.description;

        if (canSaveDraft && saveDraftRef.current) {
            try {
                await saveDraftRef.current();
            } catch (error) {
                console.error('Failed to save draft on modal close:', error);
                onOpenChange(false);
                dispatch(uploadActions.setStep('file'));
            }
            return;
        }

        onOpenChange(false);
        dispatch(uploadActions.setStep('file'));
    };

    const getStepContent = () => {
        switch (currentStep) {
            case 'progress':
                return <UploadProgressStep />;
            case 'details':
                return <SermonDetailsForm />;
            case 'settings':
                return <ListenerSettings />;
            case 'review':
                return null;
            default:
                return <UploadProgressStep />;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 'progress':
                return 'Upload Progress';
            case 'details':
                return 'Sermon Details';
            case 'settings':
                return 'Listener Settings';
            case 'review':
                return 'Review & Submit';
            default:
                return 'Upload Sermon';
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 'progress':
                return uploadData.file && uploadComplete;
            case 'details':
                return (
                    uploadData.title?.trim() &&
                    uploadData.description?.trim() &&
                    uploadData.category?.trim() &&
                    uploadData.title.length >= 3 &&
                    uploadData.description.length >= 10
                );
            case 'settings':
                return true; // Settings are optional
            case 'review':
                return uploadData.file && uploadData.title;
            default:
                return false;
        }
    };

    const tabAllowsNavigation = (stepKey: string) => {
        if (stepKey === currentStep) return true;
        if (!hasUploadFile) return stepKey === 'progress';
        return true;
    };

    const shellClassName = cn(
        UPLOAD_SHELL.maxWidthClass,
        UPLOAD_SHELL.modalHeightClass,
        'flex flex-col p-0 !gap-0 overflow-hidden shadow-xl',
        UPLOAD_SHELL.outerRadius,
        UPLOAD_SHELL.outerBorder,
        UPLOAD_SHELL.outerBg,
        embedded && 'mx-auto',
    );

    const wizardTitle = `Upload sermons — ${getStepTitle()}`;

    const wizardBody = (
        <>
            {embedded ? (
                <h2 className="sr-only">{wizardTitle}</h2>
            ) : (
                <DialogTitle className="sr-only">{wizardTitle}</DialogTitle>
            )}

                <DialogHeader className="space-y-0 border-0 bg-transparent p-0">
                    <div
                        className={cn(
                            'flex items-center justify-between gap-4 border-b border-[#545454]/50 px-4',
                            UPLOAD_SHELL.headerMinH,
                            UPLOAD_SHELL.outerBg,
                        )}
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            <img
                                src="/images/assets/upload-file.svg"
                                alt=""
                                className="h-5 w-5 shrink-0 opacity-95"
                                width={20}
                                height={20}
                            />
                            <span
                                className={cn(
                                    UPLOAD_SHELL.titleText,
                                    'truncate',
                                )}
                            >
                                Upload sermons
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => void handleClose()}
                            className="shrink-0 rounded-sm p-1 text-[#eaeaea] opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/50"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" strokeWidth={2} />
                        </button>
                    </div>

                    <div
                        className={cn(
                            'flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-[#545454]/50 px-3 py-2 md:px-4',
                            UPLOAD_SHELL.outerBg,
                        )}
                    >
                        {UPLOAD_STEP_TABS.flatMap((tab, idx) => {
                            const allowed = tabAllowsNavigation(tab.key);
                            const isActive = currentStep === tab.key;
                            const innerInactiveClass =
                                tab.inactiveInner === 'pill'
                                    ? UPLOAD_SHELL.tabInnerInactivePill
                                    : UPLOAD_SHELL.tabInnerInactiveGhost;
                            const btn = (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleStepClick(tab.key)}
                                    disabled={!allowed}
                                    className={cn(
                                        UPLOAD_SHELL.tabButtonBase,
                                        !isActive &&
                                            UPLOAD_SHELL.tabButtonInactive,
                                        !allowed &&
                                            'pointer-events-none opacity-40',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            UPLOAD_SHELL.tabInnerRow,
                                            isActive
                                                ? UPLOAD_SHELL.tabInnerActive
                                                : innerInactiveClass,
                                            isActive
                                                ? 'text-[#eaeaea]'
                                                : 'text-[#bdbdbd]',
                                        )}
                                    >
                                        <img
                                            src={tab.iconSrc}
                                            alt=""
                                            aria-hidden
                                            className={cn(
                                                UPLOAD_SHELL.tabIcon,
                                                isActive
                                                    ? UPLOAD_SHELL.tabIconActive
                                                    : UPLOAD_SHELL.tabIconInactive,
                                            )}
                                        />
                                        <span className="min-w-0 truncate">
                                            {tab.label}
                                        </span>
                                    </span>
                                    <div
                                        className={
                                            UPLOAD_SHELL.tabFlexGrowBeforeLine
                                        }
                                    />
                                    <div
                                        className={
                                            isActive
                                                ? UPLOAD_SHELL.tabActiveLine
                                                : UPLOAD_SHELL.tabInactiveLine
                                        }
                                        aria-hidden
                                    />
                                </button>
                            );
                            if (idx === 0) return [btn];
                            return [
                                <div
                                    key={`sep-${tab.key}`}
                                    className={UPLOAD_SHELL.divider}
                                    aria-hidden
                                />,
                                btn,
                            ];
                        })}
                    </div>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col px-3 pb-2 pt-3 md:px-4">
                    <div
                        className={cn(
                            UPLOAD_SHELL.contentCard,
                            'flex min-h-0 flex-1 flex-col overflow-hidden',
                        )}
                    >
                        <div className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto p-6 md:p-8">
                            {currentStep !== 'review' ? getStepContent() : null}
                            {hasUploadFile ? (
                                <ReviewSubmit
                                    showPanel={currentStep === 'review'}
                                    onModalClose={() => onOpenChange(false)}
                                    onSubmitRef={reviewSubmitRef}
                                    onSaveDraftRef={saveDraftRef}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        'flex w-full items-center border-t border-[#545454]/50 px-4 py-2',
                        UPLOAD_SHELL.footerMinH,
                        UPLOAD_SHELL.footerBg,
                        showFooterUploadStatus
                            ? 'justify-between gap-4'
                            : 'justify-end gap-3',
                    )}
                >
                    {showFooterUploadStatus && uploadData.file ? (
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            {isTransferring ? (
                                <>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Icon
                                            icon={
                                                UPLOAD_SHELL.iconifyFooterUploadGlyph
                                            }
                                            width={20}
                                            height={20}
                                            className="shrink-0 text-[#bdbdbd]"
                                            aria-hidden
                                        />
                                        <Loader2
                                            className="h-4 w-4 shrink-0 animate-spin text-[#bdbdbd]"
                                            aria-hidden
                                        />
                                    </div>
                                    <p
                                        className={
                                            UPLOAD_SHELL.footerStatusText
                                        }
                                    >
                                        Uploading{' '}
                                        {Math.round(Math.min(99, progress))}%
                                        <span
                                            className={
                                                UPLOAD_SHELL.footerStatusMuted
                                            }
                                        >
                                            {' '}
                                            …{' '}
                                        </span>
                                        <span className="text-[#bdbdbd]">
                                            {uploadEtaLabel ?? ''}
                                        </span>
                                    </p>
                                </>
                            ) : isProcessingActive ? (
                                <>
                                    <Icon
                                        icon={
                                            UPLOAD_SHELL.iconifyFooterUploadGlyph
                                        }
                                        width={20}
                                        height={20}
                                        className="shrink-0 text-[#bdbdbd]"
                                        aria-hidden
                                    />
                                    <Loader2
                                        className="h-4 w-4 shrink-0 animate-spin text-[#bdbdbd]"
                                        aria-hidden
                                    />
                                    <p
                                        className={
                                            UPLOAD_SHELL.footerStatusText
                                        }
                                    >
                                        {isStallError
                                            ? 'Processing is taking too long'
                                            : isStallWarn
                                              ? 'Still processing...'
                                              : (pipelineLabel ?? 'Processing...')}
                                        {processingEtaLabel ? (
                                            <>
                                                <span
                                                    className={
                                                        UPLOAD_SHELL.footerStatusMuted
                                                    }
                                                >
                                                    {' '}
                                                    …{' '}
                                                </span>
                                                <span className="text-[#bdbdbd]">
                                                    {processingEtaLabel}
                                                </span>
                                            </>
                                        ) : null}
                                    </p>
                                </>
                            ) : uploadComplete ? (
                                <>
                                    <Icon
                                        icon={
                                            UPLOAD_SHELL.iconifyFooterUploadGlyph
                                        }
                                        width={20}
                                        height={20}
                                        className="shrink-0 text-[#bdbdbd]"
                                        aria-hidden
                                    />
                                    <Icon
                                        icon={
                                            UPLOAD_SHELL.iconifyFooterUploadSuccessGlyph
                                        }
                                        width={20}
                                        height={20}
                                        className="shrink-0 text-[#08ffdb]"
                                        aria-hidden
                                    />
                                    <p className="shrink-0 font-matter text-[13px] leading-5 text-[#bdbdbd]">
                                        {pipelineLabel ?? 'Upload complete'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Icon
                                        icon={
                                            UPLOAD_SHELL.iconifyFooterUploadGlyph
                                        }
                                        width={20}
                                        height={20}
                                        className="shrink-0 text-[#bdbdbd]"
                                        aria-hidden
                                    />
                                    <p
                                        className={
                                            UPLOAD_SHELL.footerStatusText
                                        }
                                    >
                                        {pipelineLabel ?? 'Waiting for upload…'}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : null}

                    <div className="flex shrink-0 items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className={UPLOAD_SHELL.ghostCta}
                            onClick={() => void handleClose()}
                        >
                            Close
                        </Button>
                        {currentStep === 'review' ? (
                            <Button
                                type="button"
                                disabled={
                                    isLoading ||
                                    uploadInFlight ||
                                    !uploadData.file ||
                                    !uploadData.title ||
                                    uploadData.coverUploadStatus !== 'uploaded'
                                }
                                className={cn(
                                    UPLOAD_SHELL.primaryCta,
                                    'min-w-[88px]',
                                )}
                                onClick={() => reviewSubmitRef.current?.()}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#292929] border-t-transparent" />
                                        Publishing…
                                    </>
                                ) : (
                                    'Publish'
                                )}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled={!canProceed()}
                                className={cn(
                                    UPLOAD_SHELL.primaryCta,
                                    'min-w-[88px] disabled:opacity-40',
                                )}
                                onClick={handleNext}
                            >
                                Continue
                            </Button>
                        )}
                    </div>
                </div>
        </>
    );

    if (embedded) {
        if (!open) {
            return null;
        }
        return (
            <div
                className={shellClassName}
                role="dialog"
                aria-label={`Upload sermons — ${getStepTitle()}`}
            >
                {wizardBody}
            </div>
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (next) {
                    onOpenChange(true);
                    return;
                }
                void handleClose();
            }}
        >
            <DialogContent
                className={cn(
                    shellClassName,
                    'top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
                )}
                showCloseButton={false}
            >
                {wizardBody}
            </DialogContent>
        </Dialog>
    );
};

export default UploadModal;
