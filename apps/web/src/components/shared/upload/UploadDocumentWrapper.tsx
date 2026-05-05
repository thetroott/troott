import { FileUploadDialog, type UploadConfig } from './file-upload';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingItems from '@/_data/onboarding';
import { IdCardIcon } from 'lucide-react';

// Configuration for document verification upload
const documentVerificationConfig: UploadConfig = {
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
            icon: IdCardIcon,
            alt: 'Back of document',
            required: true,
        },
    ],
    submitButtonText: 'Continue',
    onSubmit: async (files) => {
        // Here you would typically upload files to your backend
        console.log('Uploading documents:', files);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Store files in localStorage or context for later use
        const fileData = Object.entries(files).reduce(
            (acc, [key, file]) => {
                if (file) {
                    acc[key] = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: URL.createObjectURL(file),
                    };
                }
                return acc;
            },
            {} as Record<string, any>,
        );

        localStorage.setItem('uploadedDocuments', JSON.stringify(fileData));
    },
};

const UploadDocumentWrapper = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Auto-navigate to next step after successful upload
    const handleUploadComplete = async (files: Record<string, File>) => {
        await documentVerificationConfig.onSubmit(files);

        // Navigate to next step in onboarding flow
        const stepGroup = OnboardingItems.find((item) =>
            location.pathname.startsWith(item.action),
        );
        const steps = stepGroup?.steps?.map((step) => step.action) || [];
        const currentIndex = steps.findIndex(
            (path) => location.pathname === path,
        );

        if (currentIndex < steps.length - 1) {
            const nextStep = steps[currentIndex + 1];
            if (nextStep) navigate(nextStep);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-7">
            <FileUploadDialog
                config={{
                    ...documentVerificationConfig,
                    onSubmit: handleUploadComplete,
                }}
                useOutletFlow={true}
            />
        </div>
    );
};

export default UploadDocumentWrapper;
