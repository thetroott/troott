import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    formatAcceptHint,
    type DocumentVerificationConfig,
} from '@/hooks/app/useDocumentVerification';

type DocumentVerificationContentProps = {
    config: DocumentVerificationConfig;
    files: Record<string, File | null>;
    handleFileChange: (fieldId: string, file: File | null) => void;
    submitting?: boolean;
};

/**
 * Document upload slots — Figma Troott `6102:16623` (passport/NIN empty),
 * `6102:16190` (filled), `6091:15526` / `6100:15802` (driver license).
 */
const DocumentVerificationContent: React.FC<
    DocumentVerificationContentProps
> = ({ config, files, handleFileChange, submitting = false }) => {
    const previewUrls = React.useRef<Record<string, string>>({});

    React.useEffect(() => {
        const urls = previewUrls.current;
        for (const field of config.fields) {
            const id = field.id;
            const file = files[id];
            if (file?.type.startsWith('image/')) {
                if (urls[id]) {
                    URL.revokeObjectURL(urls[id]);
                }
                urls[id] = URL.createObjectURL(file);
            } else if (urls[id]) {
                URL.revokeObjectURL(urls[id]);
                delete urls[id];
            }
        }
    }, [files, config.fields]);

    React.useEffect(() => {
        const urls = previewUrls.current;
        return () => {
            for (const url of Object.values(urls)) {
                URL.revokeObjectURL(url);
            }
        };
    }, []);

    const isDual = config.layout === 'dual';

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-2 text-left">
                <h3 className="font-matter-medium text-[20px] leading-[30px] text-[#eaeaea]">
                    {config.headline}
                </h3>
                <p className="font-matter text-base leading-6 tracking-[0.16px] text-[#bdbdbd]">
                    {config.description}
                </p>
            </div>

            <div
                className={cn(
                    'grid gap-[13px]',
                    isDual ? 'grid-cols-2' : 'grid-cols-1',
                )}
            >
                {config.fields.map((field) => {
                    const Icon = field.icon;
                    const file = files[field.id];
                    const preview = previewUrls.current[field.id];
                    const acceptString = field.acceptedFormats.join(',');
                    const filled = Boolean(file);

                    return (
                        <div key={field.id} className="flex flex-col gap-2">
                            <div
                                className={cn(
                                    'relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg text-center transition-colors',
                                    isDual ? 'h-[156px]' : 'h-[180px]',
                                    filled
                                        ? 'border border-[#707070] bg-[#eaeaea]/20'
                                        : 'border border-dashed border-[#bdbdbd]/30 bg-transparent',
                                    !filled &&
                                        !submitting &&
                                        'hover:border-[#bdbdbd]/50',
                                    submitting && 'pointer-events-none opacity-60',
                                )}
                            >
                                <input
                                    type="file"
                                    accept={acceptString}
                                    disabled={submitting}
                                    onChange={(e) =>
                                        handleFileChange(
                                            field.id,
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="hidden"
                                    id={`doc-verify-${field.id}`}
                                />
                                {submitting && file ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-[#08ffdb]" />
                                ) : filled && preview ? (
                                    <img
                                        src={preview}
                                        alt={field.alt}
                                        className="h-full w-full object-cover"
                                    />
                                ) : filled ? (
                                    <div className="px-3 text-sm text-[#eaeaea]">
                                        {file?.name}
                                    </div>
                                ) : (
                                    <label
                                        htmlFor={`doc-verify-${field.id}`}
                                        className="flex cursor-pointer flex-col items-center gap-2 px-4"
                                    >
                                        <Icon
                                            className="h-10 w-10 text-[#eaeaea]"
                                            strokeWidth={1.25}
                                            aria-hidden
                                        />
                                        <span className="font-matter-semibold text-base leading-6 tracking-[0.16px] text-[#eaeaea]">
                                            {field.uploadText}
                                        </span>
                                        <span className="font-matter text-xs leading-[18px] tracking-[0.24px] text-[#bdbdbd]">
                                            {formatAcceptHint(
                                                field.acceptedFormats,
                                            )}
                                        </span>
                                    </label>
                                )}
                            </div>
                            {filled && !submitting ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleFileChange(field.id, null)
                                    }
                                    className="mx-auto w-fit rounded border border-[#eaeaea] px-3 py-0.5 font-matter-medium text-sm leading-5 tracking-[0.14px] text-[#eaeaea] hover:bg-white/5"
                                >
                                    {field.reuploadText}
                                </button>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DocumentVerificationContent;
