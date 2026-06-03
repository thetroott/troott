import { UserType } from '@/models/User.model';
import type { MinisterResponseDTO } from '@/dtos/minister.dto';
import type { CreatorResponseDTO } from '@/dtos/creator.dto';
import { isMinisterOnboardingComplete } from '@/utils/minister-onboarding.util';
import { isCreatorOnboardingComplete } from '@/utils/creator-onboarding.util';
import { normalizePortalUserType } from '@/utils/roles.util';

type UserOnboardSlice = {
    onboard?: { status?: string };
} | null;

/** Whether studio onboarding is done for minister or creator (Get Started hidden when true). */
export function isStudioOnboardingComplete(
    userType: string | UserType,
    minister: MinisterResponseDTO | null | undefined,
    user: UserOnboardSlice,
    creator?: CreatorResponseDTO | null | undefined,
): boolean {
    const ut = normalizePortalUserType(String(userType));

    if (ut === UserType.MINISTER) {
        if (isMinisterOnboardingComplete(minister)) {
            return true;
        }
        return user?.onboard?.status === 'completed';
    }

    if (ut === UserType.CREATOR) {
        if (isCreatorOnboardingComplete(creator)) {
            return true;
        }
        return user?.onboard?.status === 'completed';
    }

    return true;
}

export function shouldShowGetStartedNavItem(
    userType: string | UserType,
    minister: MinisterResponseDTO | null | undefined,
    user: UserOnboardSlice,
    creator?: CreatorResponseDTO | null | undefined,
): boolean {
    const ut = normalizePortalUserType(String(userType));

    if (ut === UserType.ADMIN || ut === UserType.SUPER) {
        return false;
    }

    if (ut === UserType.MINISTER || ut === UserType.CREATOR) {
        return !isStudioOnboardingComplete(ut, minister, user, creator);
    }

    return false;
}
