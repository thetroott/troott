import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import cookieService from '@/api/services/cookies';
import { useSession } from '@/context/session/sessionState';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import { useStudio } from '@/context/studio/useStudio';
import useContextType from '@/hooks/shared/useContextType';
import { isStudioContentRole } from '@/utils/roles.util';
import { UserType } from '@/models/User.model';
import { normalizeUserType } from '@/utils/auth-redirect.util';
import { isStudioOnboardingComplete } from '@/utils/portal-onboarding.util';
import { navigateToStudioPortal } from '@/utils/studio-portal.util';
import useGoTo from '@/hooks/shared/useGoTo';

/**
 * Blocks `/get-started` for ministers/creators who already finished onboarding.
 * Sends them to `/studio/{code}` (Dashboard) instead.
 */
export default function GetStartedOnboardingGate() {
    const { navigate } = useGoTo();
    const { isHydratingSession } = useSession();
    const { minister, isLoading: ministerLoading } = useMinister();
    const { creator, isLoading: creatorLoading } = useCreator();
    const { studioCode } = useStudio();
    const { userContext } = useContextType();

    const sessionUser = userContext.user as {
        userType?: string;
        onboard?: { status?: string };
        studioCode?: string | null;
    } | null;

    const userType = normalizeUserType(
        String(
            sessionUser?.userType ?? cookieService.getUserType() ?? '',
        ),
    );

    const profileLoading =
        isStudioContentRole(userType) &&
        (isHydratingSession ||
            (userType === UserType.MINISTER && ministerLoading) ||
            (userType === UserType.CREATOR && creatorLoading));

    const onboardingComplete =
        !isStudioContentRole(userType) ||
        isStudioOnboardingComplete(
            userType,
            minister,
            sessionUser,
            creator,
        );

    useEffect(() => {
        if (profileLoading || !onboardingComplete) {
            return;
        }

        void navigateToStudioPortal(
            (path) => navigate(path, { replace: true }),
            studioCode ||
                sessionUser?.studioCode ||
                undefined,
        );
    }, [
        profileLoading,
        onboardingComplete,
        navigate,
        studioCode,
        sessionUser?.studioCode,
    ]);

    if (profileLoading) {
        return null;
    }

    if (onboardingComplete && isStudioContentRole(userType)) {
        return null;
    }

    return <Outlet />;
}
