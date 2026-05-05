import React from 'react';
import { Button } from '@/components/ui/button';

interface DocumentVerificationContentProps {
    config: {
        title: string;
        description: string;
        fields: Array<{
            id: string;
            label: string;
            uploadText: string;
            acceptedFormats: string[];
            icon: React.ComponentType<any>;
            alt: string;
            required: boolean;
        }>;
        submitButtonText: string;
    };
    files: Record<string, File | null>;
    handleFileChange: (fieldId: string, file: File | null) => void;
    handleSubmit: () => void;
    canSubmit: boolean;
    handleClose: () => void;
}

const DocumentVerificationContent: React.FC<
    DocumentVerificationContentProps
> = ({
    config,
    files,
    handleFileChange,
    handleSubmit,
    canSubmit,
    handleClose,
}) => {
    return (
        <div className="space-y-6 py-4 flex-1 overflow-hidden">
            <div className="text-left space-y-2">
                <h3 className="text-base font-medium">{config.title}</h3>
                <p
                    className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: config.description }}
                />
            </div>

            <div className="pt-2">
                <div
                    className={`grid gap-4 ${config.fields.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
                >
                    {config.fields.map((field) => {
                        const Icon = field.icon;
                        const file = files[field.id];
                        const acceptString = field.acceptedFormats.join(',');

                        return (
                            <div key={field.id} className="space-y-1">
                                <div
                                    className={`${file ? 'border-0' : 'border border-dashed border-gray-300'} rounded-lg p-7 text-center hover:border-gray-400 transition-colors h-48`}
                                >
                                    <input
                                        type="file"
                                        accept={acceptString}
                                        onChange={(e) =>
                                            handleFileChange(
                                                field.id,
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="hidden"
                                        id={`${field.id}-upload`}
                                    />
                                    {file ? (
                                        <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={field.alt}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor={`${field.id}-upload`}
                                            className="cursor-pointer flex flex-col items-center space-y-1"
                                        >
                                            <Icon className="h-6 w-6 text-gray-400" />
                                            <span className="text-xs text-gray-600">
                                                {field.uploadText}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                {field.acceptedFormats
                                                    .map(
                                                        (f) =>
                                                            f
                                                                .split('/')?.[1]
                                                                ?.toUpperCase() ||
                                                            f,
                                                    )
                                                    .join(' or ')}{' '}
                                                only
                                            </span>
                                        </label>
                                    )}
                                </div>
                                {file && (
                                    <div className="flex justify-center mt-1">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleFileChange(
                                                    field.id,
                                                    null,
                                                );
                                            }}
                                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                                        >
                                            Re-{field.label.toLowerCase()}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DocumentVerificationContent;
