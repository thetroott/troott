import type { MinisterResponseDTO } from '@/dtos/minister.dto';
import type { CreatorResponseDTO } from '@/dtos/creator.dto';
import { UserType } from '@/models/User.model';
import { normalizePortalUserType } from '@/utils/roles.util';
import { isStudioOnboardingComplete } from '@/utils/portal-onboarding.util';
import {
    PATH_GET_STARTED,
    PATH_SEG_SERMONS_UPLOAD,
} from '@/routes/paths';
import { isStudioHomePath } from '@/utils/studio-nav.util';
import { isTourLaunchPending, TOUR_SESSION_KEYS } from '@/components/shared/tour/tour-steps';

/** Matches API minister/creator onboarding step constants. */
export const ONBOARDING_STEP_PERSONAL = 1;
export const ONBOARDING_STEP_DOCUMENT = 2;
export const ONBOARDING_STEP_ADDRESS = 3;
export const ONBOARDING_STEP_MINISTRY = 4;
export const ONBOARDING_STEP_TOUR = 5;
export const ONBOARDING_STEP_FIRST_SERMON = 6;

export const ONBOARDING_PROFILE_REFRESH_EVENT =
    'troott:onboarding-profile-refresh';

export function dispatchOnboardingProfileRefresh(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ONBOARDING_PROFILE_REFRESH_EVENT));
    }
}

export function resolveOnboardingStep(
    userType: string | UserType,
    minister: MinisterResponseDTO | null | undefined,
    creator: CreatorResponseDTO | null | undefined,
    user: { onboard?: { step?: number; status?: string } } | null | undefined,
): number {
    const ut = normalizePortalUserType(String(userType));

    if (ut === UserType.MINISTER) {
        const raw = minister?.onboarding?.step ?? user?.onboard?.step;
        const step = typeof raw === 'number' ? raw : Number(raw);
        return Number.isFinite(step) ? step : 0;
    }

    if (ut === UserType.CREATOR) {
        const raw = creator?.onboarding?.step ?? user?.onboard?.step;
        if (raw != null) {
            const step = typeof raw === 'number' ? raw : Number(raw);
            return Number.isFinite(step) ? step : 0;
        }
        if (user?.onboard?.status === 'completed') {
            return ONBOARDING_STEP_FIRST_SERMON;
        }
    }

    return 0;
}

/** Hub checklist item ids `"1"`–`"4"` complete from server `onboarding.step`. */
export function hubCompletedItemIds(step: number): string[] {
    const ids: string[] = [];
    if (step >= ONBOARDING_STEP_DOCUMENT) ids.push('1');
    if (step >= ONBOARDING_STEP_MINISTRY) ids.push('2');
    if (step >= ONBOARDING_STEP_TOUR) ids.push('3');
    if (step >= ONBOARDING_STEP_FIRST_SERMON) ids.push('4');
    return ids;
}

export function isStudioUploadNavHref(href: string): boolean {
    const normalized = href.split('?')[0] ?? href;
    return (
        normalized.includes(`/${PATH_SEG_SERMONS_UPLOAD}`) ||
        normalized.includes('/upload-sermon')
    );
}

/**
 * When true, sidebar should send user to Get Started instead of `targetHref`.
 * After tour (step >= 5), studio upload URLs remain allowed until onboarding completes.
 */
export function shouldRedirectStudioNavForOnboarding(
    targetHref: string,
    userType: string | UserType,
    minister: MinisterResponseDTO | null | undefined,
    user: { onboard?: { status?: string } } | null | undefined,
    creator?: CreatorResponseDTO | null | undefined,
): boolean {
    if (
        isStudioOnboardingComplete(userType, minister, user ?? null, creator)
    ) {
        return false;
    }

    if (
        targetHref === PATH_GET_STARTED ||
        targetHref.startsWith(`${PATH_GET_STARTED}/`)
    ) {
        return false;
    }

    if (!targetHref.startsWith('/studio/')) {
        return false;
    }

    const pathOnly = targetHref.split('?')[0]?.replace(/\/+$/, '') || '/';
    const step = resolveOnboardingStep(userType, minister, creator, user);

    if (
        isStudioHomePath(pathOnly) &&
        step >= ONBOARDING_STEP_MINISTRY &&
        step < ONBOARDING_STEP_FIRST_SERMON
    ) {
        return false;
    }

    if (step >= ONBOARDING_STEP_TOUR && isStudioUploadNavHref(targetHref)) {
        return false;
    }

    return true;
}

/**
 * Allow limited studio routes while onboarding is still in progress
 * (interactive tour on studio home, upload wizard after tour).
 */
export function canAccessStudioDuringOnboarding(
    pathname: string,
    userType: string | UserType,
    minister: MinisterResponseDTO | null | undefined,
    creator: CreatorResponseDTO | null | undefined,
    user: { onboard?: { step?: number; status?: string } } | null | undefined,
    searchTour?: string | null,
): boolean {
    const pathOnly = pathname.split('?')[0]?.replace(/\/+$/, '') || '/';

    if (isTourLaunchPending(searchTour)) {
        return isStudioHomePath(pathOnly);
    }

    const step = resolveOnboardingStep(userType, minister, creator, user);

    if (
        isStudioHomePath(pathOnly) &&
        step >= ONBOARDING_STEP_MINISTRY &&
        step < ONBOARDING_STEP_FIRST_SERMON
    ) {
        return true;
    }

    if (step >= ONBOARDING_STEP_TOUR && isStudioUploadNavHref(pathOnly)) {
        return true;
    }

    return false;
}
