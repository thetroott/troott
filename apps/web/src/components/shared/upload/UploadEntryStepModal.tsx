import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPLOAD_SHELL } from '@/components/shared/upload/upload-studio-ui';

const ACCEPTED_TYPES = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/m4a',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'audio/x-flac',
    'audio/wma',
    'audio/x-ms-wma',
];

const ACCEPTED_EXTENSIONS = [
    '.mp3',
    '.wav',
    '.m4a',
    '.aac',
    '.ogg',
    '.webm',
    '.flac',
    '.wma',
];

const MAX_SIZE = 100 * 1024 * 1024;

function validateAudioFile(file: File): string | null {
    if (file.size > MAX_SIZE) {
        return `File size must be less than ${Math.round(MAX_SIZE / (1024 * 1024))}MB`;
    }
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const isValidMimeType =
        ACCEPTED_TYPES.includes(fileType) || fileType.startsWith('audio/');
    const isValidExtension = ACCEPTED_EXTENSIONS.includes(fileExtension);
    if (!isValidMimeType && !isValidExtension) {
        return 'Please upload a valid audio file (MP3, WAV, M4A, AAC, OGG, FLAC, etc.)';
    }
    return null;
}

export interface UploadEntryStepModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileSelected: (file: File) => void;
    isLoading?: boolean;
}

/**
 * Upload entry (step 1) — Troott Figma `4281:11102` (shell matches studio modals
 * `4530:20801` / `4530:21351` / `4555:6094` / `4558:8281`): same outer width, min-height,
 * colors, Matter type, and `#08ffdb` primary CTA as the main upload wizard.
 */
const UploadEntryStepModal: React.FC<UploadEntryStepModalProps> = ({
    open,
    onOpenChange,
    onFileSelected,
    isLoading = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [validationError, setValidationError] = useState('');

    const commitFile = (file: File) => {
        const error = validateAudioFile(file);
        if (error) {
            setValidationError(error);
            return;
        }
        setValidationError('');
        onFileSelected(file);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setValidationError('');
            setIsDragActive(false);
        }
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn(
                    'flex flex-col p-0 !gap-0 overflow-hidden shadow-xl sm:max-w-[827px]',
                    'top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
                    UPLOAD_SHELL.widthClass,
                    UPLOAD_SHELL.maxWidthClass,
                    UPLOAD_SHELL.minHeightClass,
                    UPLOAD_SHELL.outerRadius,
                    UPLOAD_SHELL.outerBorder,
                    UPLOAD_SHELL.outerBg,
                )}
                overlayClassName="bg-black/40"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Upload sermons</DialogTitle>
                <DialogDescription className="sr-only">
                    Choose an audio file to upload or continue a saved draft.
                </DialogDescription>

                {/* Header — Figma Frame 1618868173 */}
                <div className="flex items-center justify-between gap-4 px-4 min-h-[46px] border-b border-[#545454]/50 bg-[#2b2a2c]">
                    <div className="flex items-center gap-2 min-w-0">
                        <img
                            src="/images/assets/upload-file.svg"
                            alt=""
                            className="h-5 w-5 shrink-0 opacity-95"
                            width={20}
                            height={20}
                        />
                        <span className="font-matter-medium text-[16px] leading-6 text-[#eaeaea] tracking-wide truncate">
                            Upload sermons
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChange(false);
                        }}
                        disabled={isLoading}
                        className="shrink-0 rounded-md p-1 text-[#eaeaea] opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/50 disabled:pointer-events-none"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" strokeWidth={2} />
                    </button>
                </div>

                {/* Body — Figma Frame 1618868680 */}
                <div
                    className={cn(
                        'flex flex-1 flex-col items-center justify-center bg-[#2b2a2c] px-6 py-16 md:py-20 transition-shadow',
                        !isLoading && 'cursor-pointer',
                        isDragActive &&
                            'ring-2 ring-[#08ffdb]/45 ring-inset ring-offset-0',
                        isLoading && 'pointer-events-none opacity-50',
                    )}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragActive(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                        const files = e.dataTransfer.files;
                        const f = files[0];
                        if (f) commitFile(f);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    role="presentation"
                >
                    <div className="flex w-full max-w-[295px] flex-col items-center text-center">
                        <img
                            src="/images/assets/upload-file.svg"
                            alt=""
                            className="h-10 w-10 mb-6 opacity-95"
                            width={40}
                            height={40}
                        />
                        <p className="font-matter-medium text-[16px] leading-6 text-[#eaeaea] tracking-wide">
                            Drag and drop sermon to upload or select sermon from
                            your device.
                        </p>
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            disabled={isLoading}
                            className={cn(
                                UPLOAD_SHELL.primaryCta,
                                'mt-6 h-[38px] min-w-[104px] px-4 focus-visible:ring-2 focus-visible:ring-[#08ffdb]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2b2a2c]',
                            )}
                        >
                            {isLoading ? 'Processing…' : 'Select files'}
                        </Button>
                    </div>

                    {validationError ? (
                        <div
                            className="mt-6 flex w-full max-w-[295px] items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-left text-sm text-destructive"
                            onClick={(e) => e.stopPropagation()}
                            role="alert"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    ) : null}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={[...ACCEPTED_TYPES, ...ACCEPTED_EXTENSIONS].join(
                        ',',
                    )}
                    className="hidden"
                    onChange={(e) => {
                        const files = e.target.files;
                        const f = files?.[0];
                        if (f) commitFile(f);
                        e.target.value = '';
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default UploadEntryStepModal;
