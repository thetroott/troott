import { useEffect } from 'react';
import { router, usePathname } from 'expo-router';
import { useContextType } from '@/context/apps/useContextType';
import { listenerOnboardingRoute } from '@/lib/onboarding-guard';
import { getToken } from '@/api/services/mmkv-storage';

/**
 * Redirects authenticated listeners with incomplete onboarding to onboarding routes.
 */
export function useOnboardingGuard() {
    const pathname = usePathname();
    const { userContext } = useContextType();

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const token = await getToken();
            if (!token || cancelled) {
                return;
            }
            const user = userContext.user;
            if (!user || typeof user !== 'object') {
                return;
            }
            const target = listenerOnboardingRoute(user);
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
    }, [pathname, userContext.user]);
}
