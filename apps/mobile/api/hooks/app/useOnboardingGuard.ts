import { useEffect } from 'react';
import { router, usePathname } from 'expo-router';
import { useContextType } from '@/context';
import type { ListenerProfile, SessionUser } from '@/context/user/types';
import { getToken } from '@/api/services/mmkv-storage';

const ONBOARDING_COMPLETE_STEP = 2;

function readOnboardingProgress(
    user: SessionUser,
    listener?: ListenerProfile | null,
): { step: number; status: string; stage: string } {
    const userOnboard =
        user && typeof user === 'object'
            ? (user.onboard as Record<string, unknown> | undefined)
            : undefined;
    const listenerOnboard =
        listener && typeof listener === 'object'
            ? (listener.onboarding as Record<string, unknown> | undefined)
            : undefined;

    const step = Math.max(
        Number(userOnboard?.step ?? 0),
        Number(listenerOnboard?.step ?? 0),
    );
    const status = String(
        userOnboard?.status ?? listenerOnboard?.status ?? 'not-started',
    );
    const stage = String(userOnboard?.stage ?? listenerOnboard?.stage ?? '');

    return { step, status, stage };
}

export function isListenerOnboardingComplete(
    user: SessionUser,
    listener?: ListenerProfile | null,
): boolean {
    if (!user || typeof user !== 'object') {
        if (listener && typeof listener === 'object') {
            const lo = listener.onboarding as
                | { step?: number; status?: string }
                | undefined;
            if (lo?.status === 'completed' || lo?.status === 'skipped') {
                return true;
            }
            return (lo?.step ?? 0) >= ONBOARDING_COMPLETE_STEP;
        }
        return false;
    }

    const { step, status } = readOnboardingProgress(user, listener);
    if (status === 'completed' || status === 'skipped') {
        return true;
    }
    return step >= ONBOARDING_COMPLETE_STEP;
}

export function listenerOnboardingRoute(
    user: SessionUser,
    listener?: ListenerProfile | null,
): string | null {
    if (isListenerOnboardingComplete(user, listener)) {
        return null;
    }

    const { step, stage } = readOnboardingProgress(user, listener);

    if (step < 1) {
        return '/(onboarding)/select-ministers';
    }

    if (stage === 'topics') {
        return '/(onboarding)/select-ministers';
    }

    return '/(onboarding)/select-interests';
}

/**
 * Redirects authenticated listeners with incomplete onboarding to onboarding routes.
 */
export function useOnboardingGuard() {
    const pathname = usePathname();
    const { userContext } = useContextType();
    const user = userContext.user;
    const listener = userContext.listener;

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const token = await getToken();
            if (!token || cancelled) {
                return;
            }
            if (!user || typeof user !== 'object') {
                return;
            }
            const target = listenerOnboardingRoute(user, listener);
            if (!target) {
                return;
            }
            if (pathname.startsWith('/(onboarding)')) {
                return;
            }
            if (pathname.startsWith('/(auth)')) {
                return;
            }
            router.replace(target as never);
        })();

        return () => {
            cancelled = true;
        };
    }, [pathname, user, listener]);
}
