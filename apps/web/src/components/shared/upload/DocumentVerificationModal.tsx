import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PATH_GET_STARTED } from '@/routes/paths';
import DocumentVerificationContent from '@/components/shared/upload/DocumentVerificationContent';
import { UPLOAD_SHELL } from '@/components/shared/upload/upload-studio-ui';
import { useGetStartedCheckpointBusy } from '@/components/shared/get-started/GetStartedProgressContext';
import { dispatchOnboardingProfileRefresh } from '@/utils/hub-onboarding.util';
import {
    useDocumentVerificationConfig,
    useSubmitDocumentVerificationMutation,
} from '@/hooks/app/useDocumentVerification';

type DocumentVerificationModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    /** After back/close — e.g. navigate from D4 upload route to D3. */
    onDismiss?: () => void;
};

export function DocumentVerificationModal({
    open,
    onOpenChange,
    onSuccess,
    onDismiss,
}: DocumentVerificationModalProps) {
    const navigate = useNavigate();
    const config = useDocumentVerificationConfig();
    const submit = useSubmitDocumentVerificationMutation();
    const { registerDocumentVerificationLeave } = useGetStartedCheckpointBusy();

    const [files, setFiles] = React.useState<Record<string, File | null>>({});
    const [showDiscardDialog, setShowDiscardDialog] = React.useState(false);
    const pendingLeaveRef = React.useRef<(() => void) | null>(null);

    React.useEffect(() => {
        if (!config) {
            return;
        }
        const initial: Record<string, File | null> = {};
        for (const field of config.fields) {
            initial[field.id] = null;
        }
        setFiles(initial);
    }, [config, open]);

    const canSubmit = React.useMemo(() => {
        if (!config) {
            return false;
        }
        return config.fields
            .filter((f) => f.required)
            .every((f) => Boolean(files[f.id]));
    }, [config, files]);

    const dirty = React.useMemo(
        () => Object.values(files).some(Boolean),
        [files],
    );

    const resetFiles = React.useCallback(() => {
        if (!config) {
            return;
        }
        const reset: Record<string, File | null> = {};
        for (const field of config.fields) {
            reset[field.id] = null;
        }
        setFiles(reset);
    }, [config]);

    const executeClose = React.useCallback(() => {
        resetFiles();
        onOpenChange(false);
        onDismiss?.();
    }, [onDismiss, onOpenChange, resetFiles]);

    const requestLeave = React.useCallback(
        (proceed: () => void) => {
            if (submit.isPending) {
                return;
            }
            if (!dirty) {
                proceed();
                return;
            }
            pendingLeaveRef.current = proceed;
            setShowDiscardDialog(true);
        },
        [dirty, submit.isPending],
    );

    const requestClose = React.useCallback(() => {
        requestLeave(executeClose);
    }, [executeClose, requestLeave]);

    React.useEffect(() => {
        if (!open) {
            registerDocumentVerificationLeave(null);
            return;
        }
        registerDocumentVerificationLeave({
            isDirty: dirty,
            requestLeave,
        });
        return () => registerDocumentVerificationLeave(null);
    }, [dirty, open, registerDocumentVerificationLeave, requestLeave]);

    const handleOpenChange = (next: boolean) => {
        if (submit.isPending) {
            return;
        }
        if (!next) {
            requestClose();
        }
    };

    const handleConfirmDiscard = () => {
        setShowDiscardDialog(false);
        const proceed = pendingLeaveRef.current;
        pendingLeaveRef.current = null;
        resetFiles();
        onOpenChange(false);
        if (proceed) {
            proceed();
        } else {
            onDismiss?.();
        }
    };

    const handleCancelDiscard = () => {
        pendingLeaveRef.current = null;
        setShowDiscardDialog(false);
    };

    const handleFileChange = (fieldId: string, file: File | null) => {
        setFiles((prev) => ({ ...prev, [fieldId]: file }));
    };

    const handleSubmit = async () => {
        if (!config || !canSubmit) {
            return;
        }
        const payload = Object.entries(files).reduce(
            (acc, [key, file]) => {
                if (file) {
                    acc[key] = file;
                }
                return acc;
            },
            {} as Record<string, File>,
        );

        try {
            await submit.mutateAsync(payload);
            toast.success('Documents submitted for verification.');
            resetFiles();
            onOpenChange(false);
            dispatchOnboardingProfileRefresh();
            navigate(PATH_GET_STARTED);
            onSuccess?.();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Could not submit documents.',
            );
        }
    };

    if (!config) {
        return null;
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent
                    showCloseButton={false}
                    className={cn(
                        'flex max-h-[92dvh] w-[477px] max-w-[477px] flex-col gap-0 overflow-hidden rounded-xl border border-[#545454]/50 bg-[#333234] p-0',
                    )}
                >
                    <DialogTitle className="sr-only">
                        Document verification
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Upload identity document images for verification
                    </DialogDescription>

                    <div className="flex min-h-[61px] items-center border-b border-[#545454]/50 px-[18px]">
                        <button
                            type="button"
                            aria-label="Close document verification"
                            onClick={requestClose}
                            disabled={submit.isPending}
                            className="mr-2 text-[#eaeaea] opacity-80 transition-opacity hover:opacity-100 disabled:opacity-40"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <span className="flex-1 text-center font-matter-medium text-base leading-6 tracking-[0.16px] text-[#eaeaea]">
                            Document verification
                        </span>
                        <span className="w-8" aria-hidden />
                    </div>

                    <div className="flex-1 overflow-y-auto px-[18px] py-6">
                        <DocumentVerificationContent
                            config={config}
                            files={files}
                            handleFileChange={handleFileChange}
                            submitting={submit.isPending}
                        />
                    </div>

                    <div className="border-t border-[#545454]/50 px-[18px] py-4">
                        <Button
                            type="button"
                            disabled={!canSubmit || submit.isPending}
                            onClick={() => void handleSubmit()}
                            className={cn(
                                'h-[42px] w-full rounded-md font-matter-medium text-sm leading-5 tracking-[0.14px]',
                                canSubmit && !submit.isPending
                                    ? 'bg-[#08ffdb] text-[#292929] hover:bg-[#07e8c9]'
                                    : 'bg-[#cefff8] text-[#9d9d9d] hover:bg-[#cefff8]',
                            )}
                        >
                            {submit.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showDiscardDialog}
                onOpenChange={(next) => {
                    if (!next) {
                        handleCancelDiscard();
                    }
                }}
            >
                <DialogContent
                    className={cn(
                        'border-[#545454]/50 bg-[#2b2a2c] p-6 text-[#eaeaea] shadow-xl sm:max-w-md',
                        '[&_[data-slot=dialog-close]]:text-[#eaeaea] [&_[data-slot=dialog-close]]:hover:bg-white/10',
                    )}
                >
                    <DialogHeader className="gap-3 text-left sm:text-left">
                        <DialogTitle
                            className={cn(UPLOAD_SHELL.titleText, 'text-left')}
                        >
                            Discard uploaded files?
                        </DialogTitle>
                        <DialogDescription asChild>
                            <p
                                className={cn(
                                    UPLOAD_SHELL.mutedLabel,
                                    'text-left text-[14px] leading-5',
                                )}
                            >
                                Discard uploaded files and close document
                                verification?
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-[#707070] font-matter-medium text-[#eaeaea] hover:bg-white/5"
                            onClick={handleCancelDiscard}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDiscard}
                        >
                            Discard
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
