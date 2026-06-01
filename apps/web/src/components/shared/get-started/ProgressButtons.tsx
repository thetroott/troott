import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingItems from '@/_data/onboarding';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { runGetStartedCheckpoint } from '@/services/get-started-checkpoint';
import { toast } from 'sonner';
import {
    PATH_GET_STARTED,
    PATH_SEG_GET_STARTED_VERIFY_DOC_UPLOAD,
} from '@/routes/paths';
import { clearDraftForCheckpointPath } from '@/services/get-started-draft-storage';
import { useGetStartedCheckpointBusy } from './GetStartedProgressContext';
import { dispatchOnboardingProfileRefresh } from '@/utils/hub-onboarding.util';

const ProgressButtons = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { busy, setBusy, documentVerificationLeave } =
        useGetStartedCheckpointBusy();

    const stepGroup = OnboardingItems.find((item) =>
        location.pathname.startsWith(item.action),
    );

    const steps = stepGroup?.steps?.map((step) => step.action) || [];
    const currentIndex = steps.findIndex((path) => location.pathname === path);

    const navigateBack = () => {
        if (location.pathname === `${PATH_GET_STARTED}/tour-guide`) {
            navigate(`${PATH_GET_STARTED}/ministry-input`);
            return;
        }
        if (currentIndex > 0) {
            const previousStep = steps[currentIndex - 1];
            if (previousStep) navigate(previousStep);
        }
    };

    const handleBack = () => {
        if (documentVerificationLeave?.isDirty) {
            documentVerificationLeave.requestLeave(navigateBack);
            return;
        }
        navigateBack();
    };

    const handleContinue = async () => {
        setBusy(true);
        try {
            const checkpoint = await runGetStartedCheckpoint(location.pathname);
            if (!checkpoint.ok) {
                toast.error(checkpoint.message ?? 'Could not save this step.');
                return;
            }

            clearDraftForCheckpointPath(location.pathname);

            const documentUploadPath = `${PATH_GET_STARTED}/${PATH_SEG_GET_STARTED_VERIFY_DOC_UPLOAD}`;

            const milestonePaths = new Set([
                `${PATH_GET_STARTED}/verify-account/personal-information`,
                `${PATH_GET_STARTED}/home-address`,
                `${PATH_GET_STARTED}/complete-profile`,
                `${PATH_GET_STARTED}/ministry-input`,
                `${PATH_GET_STARTED}/tour-guide`,
            ]);
            if (milestonePaths.has(location.pathname)) {
                dispatchOnboardingProfileRefresh();
            }

            if (location.pathname === documentUploadPath) {
                navigate(PATH_GET_STARTED);
                return;
            }

            if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1];
                if (nextStep) navigate(nextStep);
            } else {
                navigate(PATH_GET_STARTED);
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between mt-8 pt-6 border-t gap-4">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={
                        busy ||
                        (currentIndex <= 0 &&
                            location.pathname !== `${PATH_GET_STARTED}/tour-guide`)
                    }
                    className="px-6 py-2 transition-colors cursor-pointer"
                >
                    <ChevronLeft size={16} />
                    Back
                </Button>
                <Button
                    onClick={() => void handleContinue()}
                    disabled={busy}
                    className="px-12 cursor-pointer transition-colors"
                >
                    {busy ? 'Saving…' : 'Continue'}
                </Button>
            </div>
        </div>
    );
};

export default ProgressButtons;
