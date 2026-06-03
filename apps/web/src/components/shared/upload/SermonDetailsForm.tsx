import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import {
    X,
    Upload as UploadIcon,
    Copy,
    ChevronUp,
    Link,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPLOAD_SHELL } from '@/components/shared/upload/upload-studio-ui';
import { useUpload, uploadActions } from '@/context/upload/uploadState';
import { useDraft } from '@/context/draft/draftState';
import { useSermonByIdQuery } from '@/hooks/app/useSermon';
import { useSermonCoverUpload } from '@/hooks/upload/useSermonCoverUpload';
import useContextType from '@/hooks/shared/useContextType';
import { useCreator } from '@/context/creator/useCreator';
import { useMinister } from '@/context/minister/useMinister';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';
import {
    coverFileFingerprint,
    resolveSermonCoverUrl,
} from '@/services/upload/sermon-cover-upload.service';
import type { IUploadFormErrors } from '@/utils/interfaces.util';

function coverUploadErrorMessage(err: unknown): string {
    if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
    ) {
        return (err as { message: string }).message;
    }
    return 'Cover upload failed. Please try again.';
}

const SermonDetailsForm: React.FC = () => {
    const { state, dispatch } = useUpload();
    const { updateDraft } = useDraft();
    const { uploadData, errors, uploadComplete, progress, currentStep } = state;
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creatorId } = useCreator();
    const user = userContext.user as Record<string, unknown> | null;
    const ministerId = resolveStudioSermonOwnerId(
        user,
        minister?.id,
        creatorId,
    );
    const { uploadCover, isUploading: coverUploading } =
        useSermonCoverUpload(ministerId);
    const { data: sermonDetail } = useSermonByIdQuery(uploadData.sermonId, {
        enabled: Boolean(uploadData.sermonId?.trim()),
        staleTime: 0,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const cropContainerRef = useRef<HTMLDivElement>(null);
    const prevStepRef = useRef(currentStep);

    const [localData, setLocalData] = useState({
        title: uploadData.title || '',
        description: uploadData.description || '',
        category: uploadData.category || '',
        seriesId: uploadData.seriesId || '',
    });

    const [localErrors, setLocalErrors] = useState<IUploadFormErrors>({});
    const [dragActive, setDragActive] = useState(false);
    const [thumbnailError, setThumbnailError] = useState<string>('');
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [tags, setTags] = useState<string[]>(uploadData.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    // Crop and zoom states
    const [cropMode, setCropMode] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [cropArea, setCropArea] = useState({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Image panning states
    const [isPanning, setIsPanning] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const validateForm = (): IUploadFormErrors => {
        const newErrors: IUploadFormErrors = {};

        if (!localData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (localData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (localData.title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters';
        }

        if (!localData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (localData.description.length < 10) {
            newErrors.description =
                'Description must be at least 10 characters';
        } else if (localData.description.length > 1000) {
            newErrors.description =
                'Description must be less than 1000 characters';
        }

        if (!localData.category.trim()) {
            newErrors.category = 'Category is required';
        }

        return newErrors;
    };

    const handleInputChange = (
        field: keyof typeof localData,
        value: string,
    ) => {
        setLocalData((prev) => ({ ...prev, [field]: value }));

        // Clear error immediately when user starts typing
        if (localErrors[field] || errors[field]) {
            setLocalErrors((prev) => ({ ...prev, [field]: undefined }));
            // Also clear from context errors
            const updatedErrors = { ...errors };
            delete updatedErrors[field];
            dispatch(uploadActions.setErrors(updatedErrors));
        }

        // Update context
        dispatch(uploadActions.setUploadData({ [field]: value }));
    };

    const handleBlur = (field?: keyof typeof localData) => {
        if (field) {
            const fieldValidation = validateField(field);
            if (fieldValidation) {
                setLocalErrors((prev) => ({
                    ...prev,
                    [field]: fieldValidation,
                }));
                dispatch(
                    uploadActions.setErrors({
                        ...errors,
                        [field]: fieldValidation,
                    }),
                );
            }
        } else {
            // Full validation (used by form submission)
            const validationErrors = validateForm();
            setLocalErrors(validationErrors);
            dispatch(uploadActions.setErrors(validationErrors));
        }
    };

    const validateField = (
        field: keyof typeof localData,
    ): string | undefined => {
        switch (field) {
            case 'title':
                if (!localData.title.trim()) {
                    return 'Title is required';
                } else if (localData.title.length < 3) {
                    return 'Title must be at least 3 characters';
                } else if (localData.title.length > 100) {
                    return 'Title must be less than 100 characters';
                }
                break;
            case 'description':
                if (!localData.description.trim()) {
                    return 'Description is required';
                } else if (localData.description.length < 10) {
                    return 'Description must be at least 10 characters';
                } else if (localData.description.length > 1000) {
                    return 'Description must be less than 1000 characters';
                }
                break;
            case 'category':
                if (!localData.category.trim()) {
                    return 'Category is required';
                }
                break;
        }
        return undefined;
    };

    const validateThumbnailFile = (file: File): string | null => {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
        ];
        if (!allowedTypes.includes(file.type)) {
            return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return 'Image size must be less than 5MB';
        }

        return null;
    };

    const maybeUploadCover = useCallback(
        async (file: File) => {
            const fingerprint = coverFileFingerprint(file);
            const sermonId = uploadData.sermonId?.trim();

            if (!sermonId) {
                dispatch(
                    uploadActions.setUploadData({
                        coverUploadStatus: 'local-only',
                        coverUploadError: null,
                        coverFileFingerprint: fingerprint,
                        thumbnail: file,
                    }),
                );
                return;
            }

            if (
                fingerprint === uploadData.coverFileFingerprint &&
                uploadData.coverUploadStatus === 'uploaded'
            ) {
                return;
            }

            dispatch(
                uploadActions.setUploadData({
                    coverUploadStatus: 'uploading',
                    coverUploadError: null,
                    coverFileFingerprint: fingerprint,
                    thumbnail: file,
                }),
            );

            try {
                const { imageUrl } = await uploadCover(sermonId, file);
                dispatch(
                    uploadActions.setUploadData({
                        coverUploadStatus: 'uploaded',
                        coverImageUrl: imageUrl,
                        thumbnailPreview: imageUrl,
                        coverUploadError: null,
                    }),
                );
            } catch (err: unknown) {
                dispatch(
                    uploadActions.setUploadData({
                        coverUploadStatus: 'error',
                        coverUploadError: coverUploadErrorMessage(err),
                    }),
                );
            }
        },
        [
            dispatch,
            uploadCover,
            uploadData.coverFileFingerprint,
            uploadData.coverUploadStatus,
            uploadData.sermonId,
        ],
    );

    useEffect(() => {
        if (!uploadData.sermonId?.trim()) {
            return;
        }
        if (uploadData.thumbnail instanceof File) {
            return;
        }
        if (
            uploadData.coverUploadStatus === 'uploaded' &&
            uploadData.coverImageUrl
        ) {
            return;
        }
        const doc = sermonDetail as Record<string, unknown> | undefined;
        if (!doc || typeof doc !== 'object') {
            return;
        }
        const inner = doc.item as Record<string, unknown> | undefined;
        const url = resolveSermonCoverUrl(inner ?? doc);
        if (!url) {
            return;
        }
        dispatch(
            uploadActions.setUploadData({
                thumbnailPreview: url,
                coverImageUrl: url,
                coverUploadStatus: 'uploaded',
                coverUploadError: null,
            }),
        );
    }, [
        dispatch,
        sermonDetail,
        uploadData.coverImageUrl,
        uploadData.coverUploadStatus,
        uploadData.sermonId,
        uploadData.thumbnail,
    ]);

    useEffect(() => {
        if (
            !uploadData.sermonId?.trim() ||
            !(uploadData.thumbnail instanceof File) ||
            uploadData.coverUploadStatus !== 'local-only'
        ) {
            return;
        }
        void maybeUploadCover(uploadData.thumbnail);
    }, [
        maybeUploadCover,
        uploadData.coverUploadStatus,
        uploadData.sermonId,
        uploadData.thumbnail,
    ]);

    useEffect(() => {
        const prev = prevStepRef.current;
        prevStepRef.current = currentStep;
        if (
            prev !== 'details' ||
            currentStep === 'details' ||
            !uploadData.sermonId?.trim()
        ) {
            return;
        }
        void updateDraft(uploadData.sermonId, {
            title: uploadData.title,
            description: uploadData.description,
            tags: uploadData.tags,
            category: uploadData.category,
            seriesId: uploadData.seriesId,
        }).catch((err: unknown) => {
            console.error('Failed to save details on step exit:', err);
        });
    }, [
        currentStep,
        updateDraft,
        uploadData.category,
        uploadData.description,
        uploadData.sermonId,
        uploadData.seriesId,
        uploadData.tags,
        uploadData.title,
    ]);

    const handleThumbnailSelect = (file: File) => {
        const validationError = validateThumbnailFile(file);
        if (validationError) {
            setThumbnailError(validationError);
            return;
        }

        setThumbnailError('');
        if (
            uploadData.thumbnailPreview?.startsWith('blob:')
        ) {
            URL.revokeObjectURL(uploadData.thumbnailPreview);
        }
        const previewUrl = URL.createObjectURL(file);

        dispatch(
            uploadActions.setUploadData({
                thumbnail: file,
                thumbnailPreview: previewUrl,
            }),
        );
        void maybeUploadCover(file);
    };

    const handleThumbnailDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleThumbnailDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleThumbnailDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        const files = e.dataTransfer.files;
        const file = files[0];
        if (file) {
            handleThumbnailSelect(file);
        }
    };

    const handleThumbnailInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = e.target.files;
        const file = files?.[0];
        if (file) {
            handleThumbnailSelect(file);
        }
    };

    const handleThumbnailClick = () => {
        fileInputRef.current?.click();
    };

    const handleThumbnailRemove = () => {
        if (uploadData.thumbnailPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(uploadData.thumbnailPreview);
        }

        dispatch(
            uploadActions.setUploadData({
                thumbnail: null,
                thumbnailPreview: null,
                coverUploadStatus: 'idle',
                coverImageUrl: null,
                coverUploadError: null,
                coverFileFingerprint: null,
            }),
        );

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Reset crop states
        setCropMode(false);
        setZoom(1);
        setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    };

    const handleZoomChange = (newZoom: number) => {
        // const prevZoom = zoom;
        const nextZoom = Math.max(0.5, Math.min(3, newZoom));
        setZoom(nextZoom);

        // Reset pan when zooming out to 1x or less
        if (nextZoom <= 1) {
            setPanOffset({ x: 0, y: 0 });
        }
    };

    const handleImagePanStart = (e: React.MouseEvent) => {
        if (zoom <= 1 || cropMode) return;
        setIsPanning(true);
        setPanStart({
            x: e.clientX - panOffset.x,
            y: e.clientY - panOffset.y,
        });
        e.preventDefault();
    };

    const handleImagePanMove = (e: React.MouseEvent) => {
        if (!isPanning || zoom <= 1 || cropMode) return;

        const newX = e.clientX - panStart.x;
        const newY = e.clientY - panStart.y;

        // Limit panning to reasonable bounds
        const maxPan = 100;
        setPanOffset({
            x: Math.max(-maxPan, Math.min(maxPan, newX)),
            y: Math.max(-maxPan, Math.min(maxPan, newY)),
        });
    };

    const handleImagePanEnd = () => {
        setIsPanning(false);
    };

    const handleCropStart = (e: React.MouseEvent) => {
        if (!cropMode) return;
        setIsDragging(true);
        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (rect) {
            setDragStart({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleCropMove = (e: React.MouseEvent) => {
        if (!isDragging || !cropMode) return;
        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const deltaX = x - dragStart.x;
            const deltaY = y - dragStart.y;

            setCropArea((prev) => ({
                ...prev,
                x: Math.max(
                    0,
                    Math.min(
                        100 - prev.width,
                        prev.x + (deltaX / rect.width) * 100,
                    ),
                ),
                y: Math.max(
                    0,
                    Math.min(
                        100 - prev.height,
                        prev.y + (deltaY / rect.height) * 100,
                    ),
                ),
            }));

            setDragStart({ x, y });
        }
    };

    const handleCropEnd = () => {
        setIsDragging(false);
    };

    // Auto-apply crop when leaving the details step
    useEffect(() => {
        return () => {
            // This cleanup function runs when the component unmounts or when dependencies change
            if (cropMode && uploadData.thumbnailPreview) {
                applyCrop();
            }
        };
    }, [currentStep]); // Depend on currentStep to trigger when navigating away

    // Alternative approach: Listen for step changes and auto-apply crop
    useEffect(() => {
        // If we're no longer on the details step and crop mode is active, apply the crop
        if (
            currentStep !== 'details' &&
            cropMode &&
            uploadData.thumbnailPreview
        ) {
            applyCrop();
        }
    }, [currentStep, cropMode, uploadData.thumbnailPreview]);

    const applyCrop = () => {
        if (!imageRef.current || !uploadData.thumbnailPreview) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const cropX = (cropArea.x / 100) * img.width;
            const cropY = (cropArea.y / 100) * img.height;
            const cropWidth = (cropArea.width / 100) * img.width;
            const cropHeight = (cropArea.height / 100) * img.height;

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            ctx?.drawImage(
                img,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight,
            );

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const croppedUrl = URL.createObjectURL(blob);
                        const croppedFile = new File([blob], 'cover.jpg', {
                            type: 'image/jpeg',
                        });
                        dispatch(
                            uploadActions.setUploadData({
                                thumbnail: croppedFile,
                                thumbnailPreview: croppedUrl,
                            }),
                        );
                        setCropMode(false);
                        void maybeUploadCover(croppedFile);
                    }
                },
                'image/jpeg',
                0.9,
            );
        };

        img.src = uploadData.thumbnailPreview;
    };

    const resetCrop = () => {
        setCropArea({ x: 0, y: 0, width: 100, height: 100 });
        setZoom(1);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            const newTags = [...tags, tagInput.trim()];
            setTags(newTags);
            dispatch(uploadActions.setUploadData({ tags: newTags }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove);
        setTags(newTags);
        dispatch(uploadActions.setUploadData({ tags: newTags }));
    };

    const handleTagKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    // const handleShowMore = () => {
    //   setShowMoreFields(true);
    // };

    const generateSermonLink = () => {
        if (uploadComplete && uploadData.sermonId) {
            // Use actual sermon ID from API response
            return `https://troott.be/sermon/${uploadData.sermonId}`;
        }

        // For series links (if sermon is part of a series)
        if (uploadComplete && uploadData.seriesId) {
            return `https://troott.be/series/${uploadData.seriesId}`;
        }

        return null;
    };

    // // Generate series link if sermon is part of a series
    // const generateSeriesLink = () => {
    //   if (uploadComplete && uploadData.seriesId) {
    //     return `https://troott.be/series/${uploadData.seriesId}`;
    //   }
    //   return null;
    // };

    const handleCopyLink = async () => {
        const link = generateSermonLink();
        if (link) {
            try {
                await navigator.clipboard.writeText(link);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        }
    };

    return (
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
            {/* Left Column - Form Fields (Scrollable) */}
            <div className="max-h-full min-h-0 space-y-4 overflow-y-auto pr-2 scrollbar-none">
                {/* Title — Figma [`4535:21468`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4535-21468) */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span id="upload-title-hint" className="sr-only">
                            This title is shown on your sermon page and in
                            search.
                        </span>
                        <Label
                            htmlFor="title"
                            className="cursor-default font-matter-medium text-[14px] text-[#eaeaea]"
                            title="This title is shown on your sermon page and in search."
                            aria-describedby="upload-title-hint"
                        >
                            Title (required)
                        </Label>
                        <Icon
                            icon={UPLOAD_SHELL.iconifyFieldLabelHintGlyph}
                            width={18}
                            height={18}
                            className="shrink-0 text-[#bdbdbd]"
                            aria-hidden
                        />
                    </div>
                    <Input
                        id="title"
                        value={localData.title}
                        onChange={(e) =>
                            handleInputChange('title', e.target.value)
                        }
                        onBlur={() => handleBlur('title')}
                        placeholder="Add a title"
                        className={cn(
                            'border-[#545454]/60 bg-[#242325] text-[#eaeaea] placeholder:text-[#707070] focus-visible:border-[#707070] focus-visible:ring-[#08ffdb]/30',
                            localErrors.title || errors.title
                                ? 'border-red-500'
                                : '',
                        )}
                    />
                    {(localErrors.title || errors.title) && (
                        <p className="text-sm text-red-500">
                            {localErrors.title || errors.title}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span id="upload-description-hint" className="sr-only">
                            Help listeners understand what this sermon is about.
                        </span>
                        <Label
                            htmlFor="description"
                            className="cursor-default font-matter-medium text-[14px] text-[#eaeaea]"
                            title="Help listeners understand what this sermon is about."
                            aria-describedby="upload-description-hint"
                        >
                            Description (required)
                        </Label>
                        <Icon
                            icon={UPLOAD_SHELL.iconifyFieldLabelHintGlyph}
                            width={18}
                            height={18}
                            className="shrink-0 text-[#bdbdbd]"
                            aria-hidden
                        />
                    </div>
                    <textarea
                        id="description"
                        value={localData.description}
                        onChange={(e) =>
                            handleInputChange('description', e.target.value)
                        }
                        onBlur={() => handleBlur('description')}
                        placeholder="Tell viewers about your sermon"
                        rows={4}
                        className={cn(
                            'flex w-full resize-none rounded-md border border-[#545454]/60 bg-[#242325] px-3 py-2 font-matter text-[14px] leading-5 text-[#eaeaea] placeholder:text-[#707070] ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/30',
                            localErrors.description || errors.description
                                ? 'border-red-500'
                                : '',
                        )}
                    />
                    {(localErrors.description || errors.description) && (
                        <p className="text-sm text-red-500">
                            {localErrors.description || errors.description}
                        </p>
                    )}
                </div>

                {/* Sermon link row — studio readonly field [`4499:19755`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4499-19755) */}
                <div className="space-y-2">
                    <Label className="font-matter-medium text-[14px] text-[#eaeaea]">
                        Link
                    </Label>
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'flex min-w-0 flex-1 items-center gap-2',
                                UPLOAD_SHELL.footerLinkField,
                            )}
                        >
                            <Link
                                className="h-4 w-4 shrink-0 text-[#707070]"
                                aria-hidden
                            />
                            {uploadComplete && generateSermonLink() ? (
                                <span className="truncate font-matter text-[13px] leading-5 text-[#08ffdb]">
                                    {generateSermonLink()}
                                </span>
                            ) : uploadData.file &&
                              progress > 0 &&
                              !uploadComplete ? (
                                <span className="font-matter text-[13px] text-[#bdbdbd]">
                                    Pending…
                                </span>
                            ) : (
                                <span className="font-matter text-[13px] leading-5 text-[#707070]">
                                    Your sermon link will appear here after
                                    upload
                                </span>
                            )}
                        </div>
                        {uploadComplete && generateSermonLink() ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCopyLink}
                                className="h-9 shrink-0 border-[#707070] bg-transparent px-2.5 text-[#eaeaea] hover:bg-white/5"
                            >
                                <Copy className="h-4 w-4" aria-hidden />
                                <span className="sr-only">
                                    {linkCopied ? 'Copied' : 'Copy link'}
                                </span>
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled
                                className="h-9 shrink-0 border-[#545454]/50 bg-transparent text-[#707070]"
                            >
                                <Copy className="h-4 w-4" aria-hidden />
                                <span className="sr-only">
                                    Copy link (available after upload)
                                </span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Show More Button */}
                {!showMoreFields && (
                    <Button
                        type="button"
                        onClick={() => setShowMoreFields(true)}
                        className="rounded-full border-0 bg-[#707070] px-4 font-matter-medium text-[13px] text-[#eaeaea] hover:bg-[#5a5a5a]"
                    >
                        Show more
                    </Button>
                )}

                {/* Additional Fields */}
                {showMoreFields && (
                    <div className="space-y-6 pt-4 border-t">
                        {/* Show Less Button */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                                Additional Fields
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMoreFields(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Show less
                            </Button>
                        </div>

                        {/* Category - Now in Show More section */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                value={localData.category}
                                onChange={(e) =>
                                    handleInputChange(
                                        'category',
                                        e.target.value,
                                    )
                                }
                                onBlur={() => handleBlur('category')}
                                className={cn(
                                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                    localErrors.category || errors.category
                                        ? 'border-red-500'
                                        : '',
                                )}
                            >
                                <option value="">Choose option</option>
                                <option value="sermon">Sermon</option>
                                <option value="teaching">Teaching</option>
                                <option value="worship">Worship</option>
                                <option value="prayer">Prayer</option>
                                <option value="testimony">Testimony</option>
                            </select>
                            {(localErrors.category || errors.category) && (
                                <p className="text-sm text-red-500">
                                    {localErrors.category || errors.category}
                                </p>
                            )}
                        </div>

                        {/* Series */}
                        <div className="space-y-2">
                            <Label htmlFor="series">Series (optional)</Label>
                            <div className="text-sm text-muted-foreground mb-2">
                                Group your sermon into series to keep your
                                teachings organized and accessible to your
                                audience.
                            </div>
                            <select
                                id="series"
                                value={localData.seriesId}
                                onChange={(e) =>
                                    handleInputChange(
                                        'seriesId',
                                        e.target.value,
                                    )
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Choose option</option>
                                <option value="foundations-of-faith">
                                    Foundations of Faith
                                </option>
                                <option value="walking-with-jesus">
                                    Walking with Jesus
                                </option>
                                <option value="psalms-study">
                                    Psalms Study
                                </option>
                                <option value="gospel-of-john">
                                    Gospel of John
                                </option>
                                <option value="christian-living">
                                    Christian Living
                                </option>
                                <option value="prayer-and-worship">
                                    Prayer and Worship
                                </option>
                                <option value="biblical-characters">
                                    Biblical Characters
                                </option>
                                <option value="end-times">End Times</option>
                                <option value="family-and-relationships">
                                    Family and Relationships
                                </option>
                                <option value="spiritual-growth">
                                    Spiritual Growth
                                </option>
                            </select>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Tags help categorize your sermon and make it
                                    easier to discover. Use them to highlight
                                    key themes or topics of your sermon.
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            id="tags"
                                            value={tagInput}
                                            onChange={(e) =>
                                                setTagInput(e.target.value)
                                            }
                                            onKeyPress={handleTagKeyPress}
                                            placeholder="Add tags to describe the theme and tone of your sermon"
                                            className="flex-1"
                                        />
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveTag(tag)
                                                        }
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column - Thumbnail Upload (Fixed Position) */}
            <div className="space-y-4 lg:sticky lg:top-0 lg:h-fit">
                <div className="space-y-2">
                    <div className="mb-2">
                        <Label className="font-matter-medium text-[14px] text-[#eaeaea]">
                            Thumbnail (required)
                        </Label>
                        <div className="mb-2 font-matter text-[13px] leading-5 text-[#bdbdbd]">
                            Set a thumbnail that stands out and draws
                            viewers&apos; attention
                        </div>
                    </div>

                    {uploadData.thumbnailPreview ? (
                        <div className="space-y-3">
                            {(uploadData.coverUploadStatus === 'local-only' ||
                                uploadData.coverUploadStatus === 'uploading' ||
                                uploadData.coverUploadStatus === 'uploaded' ||
                                uploadData.coverUploadStatus === 'error') && (
                                <div
                                    className={cn(
                                        'flex items-center gap-2 rounded-md px-3 py-2 text-[13px]',
                                        uploadData.coverUploadStatus ===
                                            'local-only' &&
                                            'bg-amber-500/10 text-amber-200',
                                        uploadData.coverUploadStatus ===
                                            'uploading' &&
                                            'bg-blue-500/10 text-blue-200',
                                        uploadData.coverUploadStatus ===
                                            'uploaded' &&
                                            'bg-emerald-500/10 text-emerald-200',
                                        uploadData.coverUploadStatus ===
                                            'error' &&
                                            'bg-red-500/10 text-red-200',
                                    )}
                                >
                                    {uploadData.coverUploadStatus ===
                                        'uploading' ||
                                    coverUploading ? (
                                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                    ) : uploadData.coverUploadStatus ===
                                      'uploaded' ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    ) : null}
                                    <span className="flex-1">
                                        {uploadData.coverUploadStatus ===
                                        'local-only'
                                            ? 'Finish audio upload first to save this cover'
                                            : uploadData.coverUploadStatus ===
                                                'uploading'
                                              ? 'Saving cover…'
                                              : uploadData.coverUploadStatus ===
                                                  'uploaded'
                                                ? 'Cover saved'
                                                : uploadData.coverUploadError ||
                                                  'Cover upload failed'}
                                    </span>
                                    {uploadData.coverUploadStatus === 'error' &&
                                    uploadData.thumbnail instanceof File ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 shrink-0"
                                            onClick={() =>
                                                void maybeUploadCover(
                                                    uploadData.thumbnail as File,
                                                )
                                            }
                                        >
                                            Retry
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                            {/* Thumbnail Preview with Crop Overlay - Portrait Dimensions */}
                            <div
                                ref={cropContainerRef}
                                className="relative overflow-hidden rounded-lg border w-full"
                                style={{
                                    minHeight: '200px',
                                    aspectRatio: '4/3',
                                }}
                                onMouseMove={
                                    cropMode
                                        ? handleCropMove
                                        : handleImagePanMove
                                }
                                onMouseUp={
                                    cropMode ? handleCropEnd : handleImagePanEnd
                                }
                                onMouseLeave={
                                    cropMode ? handleCropEnd : handleImagePanEnd
                                }
                            >
                                <img
                                    ref={imageRef}
                                    src={uploadData.thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className={`w-full h-full object-cover ${
                                        zoom > 1 && !cropMode
                                            ? 'cursor-grab'
                                            : ''
                                    } ${isPanning ? 'cursor-grabbing' : ''}`}
                                    style={{
                                        transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                                        transformOrigin: 'center',
                                        transition:
                                            isDragging || isPanning
                                                ? 'none'
                                                : 'transform 0.2s ease',
                                    }}
                                    onMouseDown={handleImagePanStart}
                                    draggable={false}
                                />

                                {/* Crop Overlay */}
                                {cropMode && (
                                    <div
                                        className="absolute border-2 border-white shadow-lg cursor-move"
                                        style={{
                                            left: `${cropArea.x}%`,
                                            top: `${cropArea.y}%`,
                                            width: `${cropArea.width}%`,
                                            height: `${cropArea.height}%`,
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.1)',
                                        }}
                                        onMouseDown={handleCropStart}
                                    >
                                        {/* Crop corners */}
                                        <div className="absolute -left-1 -top-1 h-3 w-3 cursor-nw-resize border border-neutral-500 bg-neutral-700"></div>
                                        <div className="absolute -right-1 -top-1 h-3 w-3 cursor-ne-resize border border-neutral-500 bg-neutral-700"></div>
                                        <div className="absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize border border-neutral-500 bg-neutral-700"></div>
                                        <div className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize border border-neutral-500 bg-neutral-700"></div>
                                    </div>
                                )}

                                {/* Remove Button */}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleThumbnailRemove}
                                    className="absolute top-2 right-2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Zoom and Crop Controls */}
                            <div className="space-y-3 w-full">
                                {/* Zoom Slider */}
                                <div className="space-y-2">
                                    <Label className="text-sm">Zoom</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleZoomChange(zoom - 0.1)
                                            }
                                            disabled={zoom <= 0.5}
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>

                                        {/* Custom Zoom Slider */}
                                        <div className="flex-1 relative">
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="3"
                                                step="0.1"
                                                value={zoom}
                                                onChange={(e) =>
                                                    handleZoomChange(
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                                                style={{
                                                    background: `linear-gradient(to right, #d1d5db 0%, #d1d5db ${((zoom - 0.5) / 2.5) * 100}%, #e5e7eb ${((zoom - 0.5) / 2.5) * 100}%, #e5e7eb 100%)`,
                                                }}
                                            />
                                            {/* Custom slider thumb */}
                                            <style>{`
                        .slider::-webkit-slider-thumb {
                          appearance: none;
                          width: 2px;
                          height: 16px;
                          background: #6b7280;
                          cursor: pointer;
                          border-radius: 1px;
                        }
                        .slider::-moz-range-thumb {
                          width: 2px;
                          height: 16px;
                          background: #6b7280;
                          cursor: pointer;
                          border-radius: 1px;
                          border: none;
                        }
                      `}</style>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleZoomChange(zoom + 0.1)
                                            }
                                            disabled={zoom >= 3}
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-center">
                                        {Math.round(zoom * 100)}%
                                        {zoom > 1 && !cropMode && (
                                            <span className="ml-2 text-blue-600">
                                                • Drag image to pan
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Crop Controls */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={
                                            cropMode ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => {
                                            setCropMode(!cropMode);
                                            if (!cropMode) {
                                                // Reset pan when entering crop mode
                                                setPanOffset({ x: 0, y: 0 });
                                                setZoom(1);
                                            }
                                        }}
                                        className="flex-1"
                                    >
                                        {cropMode ? 'Exit Crop' : 'Crop Image'}
                                    </Button>

                                    {cropMode && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={resetCrop}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                                dragActive
                                    ? 'border-[#08ffdb] bg-[#08ffdb]/5'
                                    : 'border-[#707070]/60 hover:border-[#707070]',
                            )}
                            onDragOver={handleThumbnailDragOver}
                            onDragLeave={handleThumbnailDragLeave}
                            onDrop={handleThumbnailDrop}
                            onClick={handleThumbnailClick}
                        >
                            <UploadIcon
                                className="mx-auto mb-4 h-10 w-10 text-[#bdbdbd]"
                                aria-hidden
                            />
                            <p className="mb-1 font-matter text-[13px] leading-5 text-[#bdbdbd]">
                                Minimum size of{' '}
                                <span className="font-matter-medium text-[#eaeaea]">
                                    808 × 632px
                                </span>
                            </p>
                            <p className="font-matter text-[12px] leading-4 text-[#707070]">
                                Use a JPG, PNG, or GIF file format
                            </p>
                        </div>
                    )}

                    {thumbnailError && (
                        <p className="text-sm text-red-500">{thumbnailError}</p>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleThumbnailInputChange}
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
};

export default SermonDetailsForm;
