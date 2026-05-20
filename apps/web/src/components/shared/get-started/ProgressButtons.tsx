import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingItems from '@/_data/onboarding';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { runGetStartedCheckpoint } from '@/services/get-started-checkpoint';
import { toast } from 'sonner';

const ProgressButtons = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);

    const stepGroup = OnboardingItems.find((item) =>
        location.pathname.startsWith(item.action),
    );

    const steps = stepGroup?.steps?.map((step) => step.action) || [];
    const currentIndex = steps.findIndex((path) => location.pathname === path);

    const handleBack = () => {
        if (location.pathname === '/get-started/tour-guide') {
            navigate('/get-started/ministry-input');
            return;
        }
        if (currentIndex > 0) {
            const previousStep = steps[currentIndex - 1];
            if (previousStep) navigate(previousStep);
        }
    };

    const handleContinue = async () => {
        setBusy(true);
        try {
            const checkpoint = await runGetStartedCheckpoint(location.pathname);
            if (!checkpoint.ok) {
                toast.error(checkpoint.message ?? 'Could not save this step.');
                return;
            }

            if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1];
                if (nextStep) navigate(nextStep);
            } else if (location.pathname === '/get-started/tour-guide') {
                navigate('/upload-sermon');
            } else {
                navigate('/get-started');
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
                            location.pathname !== '/get-started/tour-guide')
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
