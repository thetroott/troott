import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload, uploadActions } from '@/context/upload/uploadState';
import UploadEntryStepModal from '@/components/shared/upload/UploadEntryStepModal';
import { UPLOAD_SHELL } from '@/components/shared/upload/upload-studio-ui';

export interface FileUploadZoneProps {
    /**
     * When true (returning minister with existing sermons), the large drop zone is
     * replaced by an Upload CTA that opens step-1 file selection in a modal.
     */
    useEntryModal?: boolean;
    /**
     * When true, open the entry modal immediately on mount.
     */
    autoOpenEntryModal?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    useEntryModal = false,
    autoOpenEntryModal = false,
}) => {
    const { state, dispatch } = useUpload();
    const { uploadData, isLoading } = state;

    const [isDragActive, setIsDragActive] = useState(false);
    const [validationError, setValidationError] = useState<string>('');
    const [entryModalOpen, setEntryModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoOpenEntryModal && !uploadData.file) {
            setEntryModalOpen(true);
        }
    }, [autoOpenEntryModal, uploadData.file]);

    // Configuration - Audio formats only
    const acceptedTypes = [
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

    // File extensions for better browser compatibility
    const acceptedExtensions = [
        '.mp3',
        '.wav',
        '.m4a',
        '.aac',
        '.ogg',
        '.webm',
        '.flac',
        '.wma',
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB (reduced for audio files)

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > maxSize) {
            return `File size must be less than ${Math.round(
                maxSize / (1024 * 1024),
            )}MB`;
        }

        // Check file type - audio only
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

        const isValidMimeType =
            acceptedTypes.includes(fileType) || fileType.startsWith('audio/');
        const isValidExtension = acceptedExtensions.includes(fileExtension);

        if (!isValidMimeType && !isValidExtension) {
            return 'Please upload a valid audio file (MP3, WAV, M4A, AAC, OGG, FLAC, etc.)';
        }

        return null;
    };

    const handleFileSelect = (file: File) => {
        const error = validateFile(file);
        if (error) {
            setValidationError(error);
            return;
        }

        setValidationError('');
        dispatch(uploadActions.setFile(file));

        // Auto-fill title based on filename (without extension)
        const fileName = file.name;
        const titleFromFile =
            fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        // Clean up the title: replace underscores/hyphens with spaces and capitalize words
        const cleanTitle = titleFromFile
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
            .trim();

        // Always set title when a new file is selected
        dispatch(uploadActions.setUploadData({ title: cleanTitle }));

        // Open upload modal on progress immediately so the upload request starts right away
        dispatch(uploadActions.setStep('progress'));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        const file = files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const file = files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the container click
        fileInputRef.current?.click();
    };

    const hasError = validationError;

    const showInlineDropZone = !uploadData.file && !useEntryModal;
    const showEntryCta = !uploadData.file && useEntryModal;

    return (
        <div className="space-y-8">
            {useEntryModal ? (
                <UploadEntryStepModal
                    open={entryModalOpen}
                    onOpenChange={setEntryModalOpen}
                    isLoading={isLoading}
                    onFileSelected={(file) => {
                        handleFileSelect(file);
                        setEntryModalOpen(false);
                    }}
                />
            ) : null}

            {/* Returning user: open step-1 modal from Upload CTA */}
            {showEntryCta ? (
                <div
                    className={cn(
                        'relative mx-auto flex max-w-xl flex-col items-center justify-center space-y-5 px-8 py-14 text-center',
                        UPLOAD_SHELL.outerRadius,
                        UPLOAD_SHELL.outerBorder,
                        UPLOAD_SHELL.outerBg,
                    )}
                >
                    <img
                        src="/images/assets/upload-file.svg"
                        alt=""
                        className="h-10 w-10 opacity-90"
                    />
                    <div className="space-y-2">
                        <h2 className={cn(UPLOAD_SHELL.titleText, 'text-lg')}>
                            Add another sermon
                        </h2>
                        <p className="mx-auto max-w-sm font-matter text-sm leading-relaxed text-[#bdbdbd]">
                            Upload a new audio file. You will move through
                            upload progress, details, listener settings, and
                            review before publishing.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => setEntryModalOpen(true)}
                        className={cn(UPLOAD_SHELL.primaryCta, 'h-[38px] px-8')}
                        disabled={isLoading}
                    >
                        Upload
                    </Button>
                </div>
            ) : null}

            {/* First-time / empty studio: full inline drop zone */}
            {showInlineDropZone ? (
                <div className="relative">
                    <div
                        className={cn(
                            'border-2 border-dashed border-border/50 bg-[#2b2a2c] rounded-2xl p-36 transition-all duration-200 cursor-pointer',
                            isDragActive && 'border-primary bg-primary/5',
                            isLoading && 'pointer-events-none opacity-50',
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClick}
                    >
                        <div className="flex flex-col items-center justify-center space-y-6">
                            {/* Upload Icon */}
                            <div className="relative">
                                <img
                                    src="/images/assets/upload-file.svg"
                                    alt="Upload"
                                    className="h-10 w-10"
                                />
                            </div>

                            {/* Upload Text */}
                            <div className="text-center max-w-xs">
                                Drag and drop sermon to upload or select sermon
                                from your device.
                            </div>

                            {/* Select Files Button */}
                            <Button
                                onClick={handleButtonClick}
                                className={cn(
                                    UPLOAD_SHELL.primaryCta,
                                    'h-[38px] min-w-[104px] px-6',
                                )}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Select files'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Error Display */}
            {hasError && (
                <div className="relative">
                    <div className="flex items-center space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {validationError}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={[...acceptedTypes, ...acceptedExtensions].join(',')}
                onChange={handleInputChange}
                className="hidden"
            />
        </div>
    );
};

export default FileUploadZone;
