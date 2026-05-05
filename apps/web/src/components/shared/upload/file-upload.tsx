import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, IdCardIcon, ImageIcon, LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingItems from '@/_data/onboarding';
import DocumentVerificationContent from './DocumentVerificationContent';
import DialogHeader from './DialogHeader';
import DialogBorder from './DialogBorder';
import DialogSubmitButton from './DialogSubmitButton';

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

interface FileUploadDialogProps {
    config: UploadConfig;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
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

const FileUploadDialog = ({
    config = defaultConfig,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    useOutletFlow = false,
}: FileUploadDialogProps) => {
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(controlledOpen || false);

    const location = useLocation();
    const navigate = useNavigate();

    // Handle controlled/uncontrolled dialog state
    const isOpen = controlledOpen !== undefined ? controlledOpen : isDialogOpen;
    const setOpen = controlledOnOpenChange || setIsDialogOpen;

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
            } else {
                setOpen(false);
                // Reset files
                const resetFiles: Record<string, File | null> = {};
                config.fields.forEach((field) => {
                    resetFiles[field.id] = null;
                });
                setFiles(resetFiles);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
        // Reset files
        const resetFiles: Record<string, File | null> = {};
        config.fields.forEach((field) => {
            resetFiles[field.id] = null;
        });
        setFiles(resetFiles);
    };

    const canSubmit = config.fields
        .filter((field) => field.required)
        .every((field) => files[field.id]);

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent
                className="mt-8 justify-center flex flex-col "
                showCloseButton={false}
            >
                <DialogHeader
                    title="Document verification"
                    handleClose={handleClose}
                />

                <DialogBorder />

                <DocumentVerificationContent
                    config={config}
                    files={files}
                    handleFileChange={handleFileChange}
                    handleSubmit={handleSubmit}
                    canSubmit={canSubmit}
                    handleClose={handleClose}
                />

                <DialogSubmitButton
                    buttonText={config.submitButtonText}
                    handleSubmit={handleSubmit}
                    canSubmit={canSubmit}
                />
            </DialogContent>
        </Dialog>
    );
};

export { FileUploadDialog };
