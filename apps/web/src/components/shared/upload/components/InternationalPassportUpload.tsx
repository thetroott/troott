import { FileUploadDialog, type UploadConfig } from '../file-upload';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingItems from '@/_data/onboarding';
import { IdCardIcon } from 'lucide-react';

// Configuration for international passport file upload
const internationalPassportConfig: UploadConfig = {
    title: 'International Passport Verification',
    description:
        'International Passport Verification<br/>Make sure that photo page of your international passport is clear and shows your <br/> personal details, photo, and passport number.',
    fields: [
        {
            id: 'international_passport_page',
            label: 'Upload International Passport Page',
            uploadText: 'Upload International Passport Photo Page',
            acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
            icon: IdCardIcon,
            alt: 'International passport photo page',
            required: true,
        },
    ],
    submitButtonText: 'Continue',
    onSubmit: async (files) => {
        console.log('Uploading international passport:', files);

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

        localStorage.setItem(
            'internationalPassportDocuments',
            JSON.stringify(fileData),
        );
    },
};

const InternationalPassportUpload = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Auto-navigate to next step after successful upload
    const handleUploadComplete = async (files: Record<string, File>) => {
        await internationalPassportConfig.onSubmit(files);

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
                    ...internationalPassportConfig,
                    onSubmit: handleUploadComplete,
                }}
                open={true}
                useOutletFlow={true}
            />
        </div>
    );
};

export default InternationalPassportUpload;
