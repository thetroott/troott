import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/get-started/PageHeader';
import { Button } from '@/components/ui/button';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import cookieService from '@/api/services/cookies';
import { PATH_GET_STARTED } from '@/routes/paths';
import { getStoredStudioCode } from '@/utils/studio-nav.util';
import {
    ONBOARDING_STEP_TOUR,
    resolveOnboardingStep,
} from '@/utils/hub-onboarding.util';
import { resolveStudioTourLaunchPath } from '@/components/shared/tour/tour-steps';

export default function TourGuidePage() {
    const navigate = useNavigate();
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creator } = useCreator();

    const user = userContext.user as { onboard?: { step?: number }; studioCode?: string | null } | null;
    const userType =
        userContext.userType || cookieService.getUserType() || '';
    const onboardingStep = resolveOnboardingStep(
        userType,
        minister,
        creator,
        user,
    );
    const tourCompleted = onboardingStep >= ONBOARDING_STEP_TOUR;

    const handleStartTour = () => {
        const tourPath = resolveStudioTourLaunchPath(
            getStoredStudioCode() || user?.studioCode || undefined,
        );
        if (tourPath) {
            navigate(tourPath);
            return;
        }
        navigate(PATH_GET_STARTED);
    };

    return (
        <div className="max-w-3xl">
            <PageHeader
                title="How to use Troott"
                description="Take a quick walkthrough of your studio dashboard — upload, navigation, sermons, analytics, and your feed."
            />

            <div className="mt-8 space-y-4">
                {tourCompleted ? (
                    <p className="font-matter text-sm leading-5 tracking-[0.14px] text-[#bdbdbd]">
                        You have already completed the studio tour. Return to the
                        Get Started hub to continue onboarding.
                    </p>
                ) : (
                    <>
                        <p className="font-matter text-sm leading-5 tracking-[0.14px] text-[#bdbdbd]">
                            The interactive tour highlights key areas of your
                            dashboard in five steps. You can skip at any time and
                            still mark this step complete.
                        </p>
                        <Button
                            type="button"
                            onClick={handleStartTour}
                            className="h-9 rounded-sm bg-[#08ffdb] px-6 font-matter text-sm font-medium leading-5 tracking-[0.14px] text-[#292929] hover:bg-[#07e8c9]"
                        >
                            Start tour
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
