import React, { Fragment, useRef } from 'react';
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
import { useUpload, uploadActions } from '@/context/upload/upload.context';
import {
    UPLOAD_SHELL,
    UPLOAD_STEP_TABS,
} from '@/components/shared/upload/upload-studio-ui';
import UploadProgressStep from './UploadProgressStep';
import SermonDetailsForm from './SermonDetailsForm';
import ListenerSettings from './ListenerSettings';
import ReviewSubmit from './ReviewSubmit';

interface UploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ open, onOpenChange }) => {
    const { state, dispatch } = useUpload();
    const { currentStep, uploadData, uploadComplete, progress, isLoading } =
        state;
    const reviewSubmitRef = useRef<(() => void) | null>(null);
    const saveDraftRef = useRef<(() => Promise<void>) | null>(null);

    // Check if upload is in progress - defined at component level for use throughout
    const isUploading =
        uploadData.file &&
        !uploadComplete &&
        isLoading &&
        progress > 0 &&
        progress < 100;
    const uploadBusyOnServer =
        Boolean(uploadData.file) && !uploadComplete && isLoading;
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

    const handleStepClick = (stepKey: string) => {
        const stepIndex = updatedSteps.findIndex(
            (step) => step.key === stepKey,
        );

        // Priority 1: Always allow navigation to progress step if file exists (even after upload completes)
        if (stepKey === 'progress' && uploadData.file) {
            dispatch(uploadActions.setStep(stepKey));
            return;
        }

        // Priority 2: After upload completes, always allow free navigation between ALL tabs
        if (uploadComplete && uploadData.file) {
            dispatch(uploadActions.setStep(stepKey));
            return;
        }

        // Priority 3: During upload, allow free navigation between all tabs
        if (isUploading) {
            dispatch(uploadActions.setStep(stepKey));
            return;
        }

        // Priority 4: When not uploading and upload not complete, use normal navigation rules
        // Allow navigation to previous steps or current step
        if (stepIndex <= currentStepIndex) {
            dispatch(uploadActions.setStep(stepKey));
            return;
        }

        // Priority 5: For forward navigation, check if current step is completed
        if (stepIndex === currentStepIndex + 1 && canProceed()) {
            dispatch(uploadActions.setStep(stepKey));
            return;
        }

        // If none of the above conditions are met, don't allow navigation
    };

    const handleNext = () => {
        if (!canProceed()) {
            return; // Don't proceed if current step is not valid
        }

        const nextStepIndex = currentStepIndex + 1;
        const nextStep = updatedSteps[nextStepIndex];
        if (nextStep) {
            dispatch(uploadActions.setStep(nextStep.key));
        }
    };

    const handleClose = async () => {
        // Auto-save to draft when closing if there's any data and upload is complete
        // (if upload is still in progress, we'll save the current state as draft)
        if (uploadData.file || uploadData.title || uploadData.description) {
            // Call save draft handler from ReviewSubmit if available, otherwise just close
            if (saveDraftRef.current) {
                try {
                    await saveDraftRef.current();
                } catch (error) {
                    console.error(
                        'Failed to save draft on modal close:',
                        error,
                    );
                }
            }
        }
        onOpenChange(false);
        // Reset to file step when closing
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
                return (
                    <ReviewSubmit
                        onModalClose={() => onOpenChange(false)}
                        onSubmitRef={reviewSubmitRef}
                        onSaveDraftRef={saveDraftRef}
                    />
                );
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

    const tabAllowsNavigation = (stepKey: string, stepIndex: number) => {
        if (stepKey === currentStep) return true;
        if (stepKey === 'progress' && uploadData.file) return true;
        if (uploadComplete && uploadData.file) return true;
        if (isUploading) return true;
        if (stepIndex <= currentStepIndex) return true;
        if (stepIndex === currentStepIndex + 1 && canProceed()) return true;
        return false;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    UPLOAD_SHELL.widthClass,
                    UPLOAD_SHELL.maxWidthClass,
                    UPLOAD_SHELL.minHeightClass,
                    'flex flex-col p-0 !gap-0 overflow-hidden shadow-xl sm:max-w-[827px]',
                    UPLOAD_SHELL.outerRadius,
                    UPLOAD_SHELL.outerBorder,
                    UPLOAD_SHELL.outerBg,
                )}
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">
                    Upload sermons — {getStepTitle()}
                </DialogTitle>

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
                            className="shrink-0 rounded-md p-1 text-[#eaeaea] opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/50"
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
                            const stepIndex = updatedSteps.findIndex(
                                (s) => s.key === tab.key,
                            );
                            const allowed = tabAllowsNavigation(
                                tab.key,
                                stepIndex,
                            );
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
                            {getStepContent()}
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
                            {uploadComplete ? (
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
                                        Upload complete
                                    </p>
                                </>
                            ) : showFinalizingUpload ? (
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
                                        Finalizing upload…
                                    </p>
                                </>
                            ) : uploadBusyOnServer ? (
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
                                            Time left —
                                        </span>
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
                                        Ready when you are
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
                            <Fragment>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={
                                        isLoading ||
                                        isUploading ||
                                        !uploadData.title
                                    }
                                    className="h-[34px] min-h-[34px] rounded-md border border-[#707070] bg-transparent px-3 font-matter-medium text-[12px] leading-[18px] text-[#eaeaea] tracking-wide hover:bg-white/5"
                                    onClick={async () => {
                                        if (saveDraftRef.current)
                                            await saveDraftRef.current();
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#eaeaea] border-t-transparent" />
                                            Saving…
                                        </>
                                    ) : (
                                        'Save as Draft'
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    disabled={
                                        isLoading ||
                                        isUploading ||
                                        !uploadData.file ||
                                        !uploadData.title
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
                            </Fragment>
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
            </DialogContent>
        </Dialog>
    );
};

export default UploadModal;
