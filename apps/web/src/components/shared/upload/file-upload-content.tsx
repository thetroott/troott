import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IdCardIcon, ImageIcon, LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingItems from '@/_data/onboarding';

// Type-safe interfaces
export interface UploadField {
    id: string;
    label: string;
    uploadText: string;
    acceptedFormats: string[];
    icon: LucideIcon;
    alt: string;
    required: boolean;
}

export interface UploadConfig {
    title: string;
    description: string;
    fields: UploadField[];
    submitButtonText: string;
    onSubmit: (files: Record<string, File>) => void | Promise<void>;
}

interface FileUploadContentProps {
    config: UploadConfig;
    useOutletFlow?: boolean;
}

// Default configuration for driver's license upload
const defaultConfig: UploadConfig = {
    title: 'Document verification',
    description:
        "Make sure photos aren't blurry and the front of your <br/> driver's license clearly shows your face.",
    fields: [
        {
            id: 'front',
            label: 'Upload Front',
            uploadText: 'Upload Front',
            acceptedFormats: ['image/jpeg', 'image/png'],
            icon: IdCardIcon,
            alt: 'Front of document',
            required: true,
        },
        {
            id: 'back',
            label: 'Upload back',
            uploadText: 'Upload back',
            acceptedFormats: ['image/jpeg', 'image/png'],
            icon: ImageIcon,
            alt: 'Back of document',
            required: true,
        },
    ],
    submitButtonText: 'Continue',
    onSubmit: async (files) => {
        console.log('Files uploaded:', files);
    },
};

const FileUploadContent = ({
    config = defaultConfig,
    useOutletFlow = false,
}: FileUploadContentProps) => {
    const [files, setFiles] = useState<Record<string, File | null>>({});

    const location = useLocation();
    const navigate = useNavigate();

    // Initialize files state based on config
    useEffect(() => {
        const initialFiles: Record<string, File | null> = {};
        config.fields.forEach((field) => {
            initialFiles[field.id] = null;
        });
        setFiles(initialFiles);
    }, [config.fields]);

    const handleFileChange = (fieldId: string, file: File | null) => {
        setFiles((prev) => ({ ...prev, [fieldId]: file }));
    };

    const handleSubmit = async () => {
        const validFiles = Object.entries(files).reduce(
            (acc, [key, file]) => {
                if (file) acc[key] = file;
                return acc;
            },
            {} as Record<string, File>,
        );

        // Check if all required files are uploaded
        const missingRequired = config.fields
            .filter((field) => field.required)
            .filter((field) => !files[field.id]);

        if (missingRequired.length > 0) {
            return; // Don't submit if required files are missing
        }

        try {
            await config.onSubmit(validFiles);

            if (useOutletFlow) {
                // Navigate to next step in onboarding flow
                const stepGroup = OnboardingItems.find((item) =>
                    location.pathname.startsWith(item.action),
                );
                const steps =
                    stepGroup?.steps?.map((step) => step.action) || [];
                const currentIndex = steps.findIndex(
                    (path) => location.pathname === path,
                );

                if (currentIndex < steps.length - 1) {
                    const nextStep = steps[currentIndex + 1];
                    if (nextStep) navigate(nextStep);
                }
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const canSubmit = config.fields
        .filter((field) => field.required)
        .every((field) => files[field.id]);

    return (
        <>
            <div className="space-y-6 py-4 text-left">
                <div className="text-left space-y-2">
                    <h3 className="text-lg font-medium">{config.title}</h3>
                    <p
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: config.description }}
                    />
                </div>

                <div className="pt-4">
                    <div
                        className={`grid gap-4 ${config.fields.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} text-left`}
                    >
                        {config.fields.map((field) => {
                            const Icon = field.icon;
                            const file = files[field.id];
                            const acceptString =
                                field.acceptedFormats.join(',');

                            return (
                                <div
                                    key={field.id}
                                    className="space-y-2 text-left"
                                >
                                    <div className="border border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
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
                                            <div className="h-20 w-full overflow-hidden rounded-lg border border-border bg-card">
                                                <img
                                                    src={URL.createObjectURL(
                                                        file,
                                                    )}
                                                    alt={field.alt}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor={`${field.id}-upload`}
                                                className="cursor-pointer flex flex-col items-center space-y-2"
                                            >
                                                <Icon className="h-8 w-8 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {field.uploadText}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {field.acceptedFormats
                                                        .map(
                                                            (f) =>
                                                                f
                                                                    .split(
                                                                        '/',
                                                                    )?.[1]
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
                                        <div className="text-left">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleFileChange(
                                                        field.id,
                                                        null,
                                                    );
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-700 text-left"
                                            >
                                                Retake
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-20 border-t border-gray-100/20 pt-8">
                <div className="flex justify-center">
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="w-full max-w-md"
                    >
                        {config.submitButtonText}
                    </Button>
                </div>
            </div>
        </>
    );
};

export { FileUploadContent };
