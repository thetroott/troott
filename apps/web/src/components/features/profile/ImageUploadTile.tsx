import * as React from 'react';
import { Camera, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/api/config';
import type { Asset } from '@/app/profile/profile.types';

type Variant = 'cover' | 'avatar';
type State = 'idle' | 'uploading' | 'error';

interface ImageUploadTileProps {
    variant: Variant;
    value: Asset | null;
    onChange: (next: Asset | null) => void;
    /**
     * Optional helper rendered below the tile (cover only). Avatar variant
     * places its own label/helper inline next to the circle.
     */
    helperText?: string;
    /**
     * Pixel-accurate width of the upload box for the cover variant
     * (Figma node 11719:104736 cover frame is 441x180).
     */
    className?: string;
    accept?: string;
    /** Used in alt text + aria labels. */
    ariaLabel: string;
}

type StorageUploadDto = {
    file?: string;
    s3Key?: string;
    fileName?: string;
    uploadRef?: string;
};

function parseStorageUploadEnvelope(data: unknown): StorageUploadDto | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const envelope = data as { data?: unknown };
    const inner =
        envelope.data && typeof envelope.data === 'object'
            ? envelope.data
            : data;
    if (!inner || typeof inner !== 'object') {
        return null;
    }
    const dto = inner as StorageUploadDto;
    if (!dto.s3Key) {
        return null;
    }
    return dto;
}

function assetFromStorageUpload(dto: StorageUploadDto): Asset {
    return {
        fileName: dto.fileName ?? '',
        s3Key: dto.s3Key ?? '',
        url: dto.file,
    };
}

function previewSrc(
    value: Asset | null,
    opts?: { v?: string | number },
): string | undefined {
    if (!value?.url) {
        return undefined;
    }
    const raw = value.url;
    if (opts?.v != null) {
        const sep = raw.includes('?') ? '&' : '?';
        return `${raw}${sep}v=${encodeURIComponent(String(opts.v))}`;
    }
    return raw;
}

/**
 * ImageUploadTile - one component, two visual variants (`cover`, `avatar`).
 * Upload uses `api.storage.uploadImage`; preview uses `ImageDTO.file` from the API.
 */
export function ImageUploadTile({
    variant,
    value,
    onChange,
    helperText,
    className,
    accept = 'image/jpeg,image/png,image/webp,image/bmp',
    ariaLabel,
}: ImageUploadTileProps) {
    const [state, setState] = React.useState<State>('idle');
    const [progress, setProgress] = React.useState(0);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const previewUrl = previewSrc(value);

    const handleFile = React.useCallback(
        async (file: File) => {
            setErrorMessage(null);

            const allowed = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/bmp',
            ];
            if (!allowed.includes(file.type)) {
                setState('error');
                setErrorMessage('JPEG, PNG, WEBP, or BMP only');
                return;
            }
            const maxBytes = 5 * 1024 * 1024;
            if (file.size > maxBytes) {
                setState('error');
                setErrorMessage('Max 5MB');
                return;
            }

            setState('uploading');
            setProgress(0);
            try {
                const res = await api.storage.uploadImage(
                    file,
                    (p: number) => setProgress(p),
                );
                const dto = parseStorageUploadEnvelope(res?.data);
                if (!dto) {
                    throw new Error('Upload failed');
                }
                onChange(assetFromStorageUpload(dto));
                setState('idle');
                setProgress(0);
            } catch (e) {
                setState('error');
                setErrorMessage(
                    e instanceof Error ? e.message : 'Upload failed',
                );
            }
        },
        [onChange],
    );

    const onPick = () => inputRef.current?.click();

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) void handleFile(file);
    };

    if (variant === 'avatar') {
        return (
            <div
                className={cn(
                    'flex items-center gap-4',
                    className,
                )}
            >
                <button
                    type="button"
                    onClick={onPick}
                    aria-label={`${value ? 'Replace' : 'Upload'} ${ariaLabel}`}
                    className={cn(
                        'group relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border border-[#08ffdb] bg-[#4a4a4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/60',
                    )}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={ariaLabel}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <svg
                            viewBox="0 0 92 92"
                            aria-hidden
                            className="h-[60%] w-[60%] text-[#1f1f1f]/70"
                        >
                            <circle
                                cx="46"
                                cy="34"
                                r="14"
                                fill="currentColor"
                            />
                            <path
                                d="M14 84c0-15 14-22 32-22s32 7 32 22"
                                fill="currentColor"
                            />
                        </svg>
                    )}

                    {state === 'uploading' ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-[11px] font-medium text-[#eaeaea]">
                            {progress}%
                        </div>
                    ) : null}

                    {previewUrl && state !== 'uploading' ? (
                        <span className="pointer-events-none absolute right-1.5 bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#1f1f1f]/80 text-[#eaeaea] opacity-90 transition-opacity group-hover:opacity-100">
                            <Camera className="h-3.5 w-3.5" />
                        </span>
                    ) : null}
                </button>

                <div className="flex min-w-0 flex-col gap-1">
                    <p className="text-sm font-medium leading-5 text-[#eaeaea]">
                        Upload an image
                    </p>
                    <p className="text-xs leading-[18px] text-[#9d9d9d]">
                        {helperText ??
                            'JPEG, PNG, WEBP, BMP, Max 5MB, 500\u00d7500 max.'}
                    </p>
                    {value ? (
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="mt-1 inline-flex items-center gap-1 self-start text-xs font-medium text-[#bdbdbd] hover:text-[#eaeaea]"
                        >
                            <X className="h-3 w-3" /> Remove
                        </button>
                    ) : null}
                    {errorMessage ? (
                        <p className="text-xs font-medium text-red-400">
                            {errorMessage}
                        </p>
                    ) : null}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={onInputChange}
                    aria-label={`Choose ${ariaLabel} file`}
                />
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <button
                type="button"
                onClick={onPick}
                aria-label={`${value ? 'Replace' : 'Upload'} ${ariaLabel}`}
                className={cn(
                    'group relative flex h-[180px] w-full items-center justify-center overflow-hidden rounded-lg border border-[#bdbdbd]/30 bg-transparent text-[#eaeaea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/60',
                    !previewUrl && 'border-dashed',
                )}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={ariaLabel}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2.5">
                        <UploadCloud
                            className="h-10 w-10 text-[#eaeaea]"
                            strokeWidth={1.6}
                            aria-hidden
                        />
                        <span className="font-matter-medium text-base leading-6 text-[#eaeaea]">
                            Upload a Photo
                        </span>
                    </div>
                )}

                {state === 'uploading' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-[#eaeaea]">
                        <div className="text-sm font-medium">
                            Uploading {progress}%
                        </div>
                        <div className="h-1 w-32 overflow-hidden rounded bg-white/15">
                            <div
                                className="h-full bg-[#08ffdb] transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : null}

                {previewUrl && state !== 'uploading' ? (
                    <span className="pointer-events-none absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#1f1f1f]/85 text-[#eaeaea] opacity-90 transition-opacity group-hover:opacity-100">
                        <Camera className="h-4 w-4" />
                    </span>
                ) : null}
            </button>

            <div className="flex items-center justify-between gap-2">
                <p className="text-sm leading-5 text-[#bdbdbd]">
                    {helperText ??
                        'Upload a cover image. JPEG, PNG, WEBP, MAX 5MB, 1280\u00d7740 max.'}
                </p>
                {value ? (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#bdbdbd] hover:text-[#eaeaea]"
                    >
                        <X className="h-3 w-3" /> Remove
                    </button>
                ) : null}
            </div>

            {errorMessage ? (
                <p className="text-xs font-medium text-red-400">
                    {errorMessage}
                </p>
            ) : null}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={onInputChange}
                aria-label={`Choose ${ariaLabel} file`}
            />
        </div>
    );
}

export default ImageUploadTile;
