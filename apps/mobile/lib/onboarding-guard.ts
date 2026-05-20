import type { SessionUser } from '@/context/user/types';

const ONBOARDING_COMPLETE_STEP = 3;

export function isListenerOnboardingComplete(user: SessionUser): boolean {
    if (!user || typeof user !== 'object') {
        return false;
    }
    const onboard = user.onboard as
        | { step?: number; status?: string }
        | undefined;
    if (!onboard) {
        return false;
    }
    if (onboard.status === 'completed' || onboard.status === 'skipped') {
        return true;
    }
    return (onboard.step ?? 0) >= ONBOARDING_COMPLETE_STEP;
}

export function listenerOnboardingRoute(user: SessionUser): string | null {
    if (isListenerOnboardingComplete(user)) {
        return null;
    }
    const step = (user?.onboard as { step?: number } | undefined)?.step ?? 0;
    if (step < 2) {
        return '/(onboarding)/select-interests';
    }
    return '/(onboarding)/select-ministers';
}
