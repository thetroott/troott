import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileAudio, Loader2, Trash2 } from 'lucide-react';
import { useUpload, uploadActions } from '@/context/upload/uploadState';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import useContextType from '@/hooks/shared/useContextType';
import { useCreator } from '@/context/creator/useCreator';
import { useMinister } from '@/context/minister/useMinister';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';
import { buildSermonUploadFileSignature } from '@/utils/sermon-upload-file-signature.util';
import { useStudioSermonAudioUpload } from '@/hooks/upload/useStudioSermonAudioUpload';
import { cn } from '@/lib/utils';
import { UPLOAD_SHELL } from '@/components/shared/upload/upload-studio-ui';

/**
 * Upload progress UI — Figma 4530:20801 (0%), 4530:21351 (in progress), 4555:6094 (finalizing),
 * 4558:8281 (complete + remove). Remove audio control matches details-frame
 * [`4660:6496`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4660-6496). Shell tokens in `UPLOAD_SHELL`.
 *
 * feat-0008: one `start-upload` per file via {@link useStudioSermonAudioUpload}.
 */
const UploadProgressStep: React.FC = () => {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creatorId } = useCreator();
    const user = userContext.user as Record<string, unknown> | null;
    const ministerId = resolveStudioSermonOwnerId(
        user,
        minister?.id,
        creatorId,
    );
    const { state, dispatch } = useUpload();
    const { uploadData, progress, uploadComplete, isLoading } = state;
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [uploadError, setUploadError] = useState(false);
    const [retryToken, setRetryToken] = useState(0);

    const file = uploadData.file;
    const fileSignature = useMemo(
        () => (file ? buildSermonUploadFileSignature(file) : null),
        [file],
    );

    const onUploadError = useCallback(() => {
        setUploadError(true);
    }, []);

    const { clearUploadFlight } = useStudioSermonAudioUpload({
        file,
        fileSignature,
        uploadComplete,
        uploadError,
        retryToken,
        dispatch,
        queryClient,
        ministerId,
        onUploadError,
    });

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleRemoveAudio = () => {
        setShowRemoveDialog(true);
    };

    const handleConfirmRemove = () => {
        clearUploadFlight();
        dispatch(uploadActions.resetUpload());
        setShowRemoveDialog(false);
    };

    const handleCancelRemove = () => {
        setShowRemoveDialog(false);
    };

    const handleConfirmCancelUpload = () => {
        clearUploadFlight();
        setShowCancelDialog(false);
        dispatch(uploadActions.resetUpload());
    };

    const handleRetry = () => {
        clearUploadFlight();
        setUploadError(false);
        setRetryToken((t) => t + 1);
    };

    const showFinalizing =
        isLoading && progress >= 100 && !uploadComplete && !uploadError;

    const cancelUploadDisabled =
        uploadComplete || (!isLoading && progress === 0 && !uploadError);

    if (!uploadData.file) {
        return (
            <div className="flex min-h-0 w-full flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-center">
                    <p className={UPLOAD_SHELL.mutedLabel}>
                        No file selected. Go back and choose an audio file to
                        upload.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="border-[#707070] font-matter-medium text-[#eaeaea]"
                        onClick={() => dispatch(uploadActions.setStep('file'))}
                    >
                        Back to file selection
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col">
            <div
                className={cn(
                    'mx-auto flex min-h-0 w-full max-w-[394px] flex-1 flex-col items-center justify-center gap-8',
                )}
            >
                {!uploadComplete && !uploadError ? (
                    <>
                        <div className="flex flex-col items-center gap-4">
                            <Loader2
                                className="h-6 w-6 shrink-0 animate-spin text-[#bdbdbd]"
                                aria-hidden
                            />
                            <p className="font-matter text-center text-[14px] leading-5 tracking-wide text-[#bdbdbd]">
                                {showFinalizing
                                    ? 'Processing...'
                                    : 'Uploading...'}
                            </p>
                        </div>

                        <div className="flex w-full flex-col items-center gap-3">
                            <div className={UPLOAD_SHELL.progressTrack}>
                                <div
                                    className={UPLOAD_SHELL.progressFill}
                                    style={{
                                        width: `${Math.min(100, Math.round(progress))}%`,
                                    }}
                                />
                            </div>
                            <p
                                className={cn(
                                    UPLOAD_SHELL.mediumLabel,
                                    'text-center',
                                )}
                            >
                                {Math.round(progress)}% completed
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            disabled={cancelUploadDisabled}
                            className={cn(
                                UPLOAD_SHELL.studioOutlineCta,
                                cancelUploadDisabled &&
                                    UPLOAD_SHELL.studioOutlineCtaDisabled,
                            )}
                            onClick={() => setShowCancelDialog(true)}
                        >
                            Cancel upload
                        </Button>
                    </>
                ) : null}

                {uploadError ? (
                    <div className="flex w-full max-w-[28rem] flex-col items-center justify-center gap-4 text-center">
                        <p className="font-matter text-[14px] leading-5 tracking-wide text-destructive">
                            Something went wrong while uploading. You can retry
                            without selecting the file again.
                        </p>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-[#707070] font-matter-medium text-[#eaeaea]"
                            onClick={handleRetry}
                        >
                            Retry upload
                        </Button>
                    </div>
                ) : null}

                {uploadComplete ? (
                    <div className="flex w-full flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-3">
                            <FileAudio
                                className="h-6 w-6 text-[#bdbdbd]"
                                aria-hidden
                            />
                            <p
                                className={cn(
                                    UPLOAD_SHELL.mediumLabel,
                                    'max-w-full break-words px-1 text-center',
                                )}
                                title={uploadData.file.name}
                            >
                                {uploadData.file.name}
                            </p>
                            <p className="font-matter text-center text-[12px] text-[#707070]">
                                {formatFileSize(uploadData.file.size)} · Audio
                            </p>
                            <p className="font-matter text-center text-[12px] text-[#9a9a9a]">
                                Uploaded
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            className={UPLOAD_SHELL.studioOutlineCta}
                            onClick={handleRemoveAudio}
                        >
                            <Trash2
                                className="mr-2 h-4 w-4 shrink-0"
                                strokeWidth={2}
                                aria-hidden
                            />
                            Remove audio
                        </Button>
                    </div>
                ) : null}
            </div>

            {/* Confirm move to draft — copy/layout ref Figma [`4660:6496`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4660-6496) */}
            <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <DialogContent
                    className={cn(
                        'sm:max-w-md border-[#545454]/50 bg-[#2b2a2c] p-6 text-[#eaeaea] shadow-xl',
                        '[&_[data-slot=dialog-close]]:text-[#eaeaea] [&_[data-slot=dialog-close]]:hover:bg-white/10',
                    )}
                >
                    <DialogHeader className="gap-3 text-left sm:text-left">
                        <DialogTitle
                            className={cn(UPLOAD_SHELL.titleText, 'text-left')}
                        >
                            Move audio to draft
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div
                                className={cn(
                                    UPLOAD_SHELL.mutedLabel,
                                    'space-y-3 text-left text-[14px] leading-5',
                                )}
                            >
                                <p>
                                    You&apos;re about to move the audio{' '}
                                    <span className="font-matter-medium break-words text-[#eaeaea]">
                                        {uploadData.file?.name ?? 'this file'}
                                    </span>{' '}
                                    to draft.
                                </p>
                                <p>
                                    You can always restore it later from the
                                    Draft section.
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-[#707070] font-matter-medium text-[#eaeaea] hover:bg-white/5"
                            onClick={handleCancelRemove}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className={UPLOAD_SHELL.primaryCta}
                            onClick={handleConfirmRemove}
                        >
                            Move to draft
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel upload?</DialogTitle>
                        <DialogDescription>
                            This stops the current upload and clears the
                            selected file. You can start again from the upload
                            step.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                        >
                            Keep uploading
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmCancelUpload}
                        >
                            Cancel upload
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UploadProgressStep;
