import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

import useContextType from '@/hooks/shared/useContextType';

const isProd = import.meta.env.VITE_APP_ENVIRONMENT === 'prod';

/**
 * Mirrors a typical authed-shell pattern: identify in PostHog / Sentry / Reo when
 * `user` is present in prod; clear when absent.
 */
export function ObservabilityUserSync() {
    const { userContext } = useContextType();
    const user = userContext.user;

    useEffect(() => {
        if (!isProd) return;

        if (user && typeof user === 'object') {
            const u = user as Record<string, unknown>;
            const id =
                (typeof u.id === 'string' ? u.id : undefined) ??
                (typeof u._id === 'string' ? u._id : undefined);
            const email =
                typeof u.email === 'string' ? u.email : undefined;
            const firstName =
                typeof u.firstName === 'string' ? u.firstName : undefined;
            const lastName =
                typeof u.lastName === 'string' ? u.lastName : undefined;
            const slug =
                typeof u.slug === 'string' ? u.slug : undefined;
            const name = [firstName, lastName].filter(Boolean).join(' ');

            const distinctId = id ?? email;
            if (distinctId) {
                posthog.identify(distinctId, {
                    ...(email ? { email } : {}),
                    ...(name ? { name } : {}),
                });
            }

            Sentry.setUser({
                id: id ?? undefined,
                email,
                username: slug,
            });

            if (typeof window !== 'undefined' && window.Reo?.identify && email) {
                window.Reo.identify({
                    username: email,
                    type: 'email',
                    ...(firstName ? { firstname: firstName } : {}),
                    ...(lastName ? { lastname: lastName } : {}),
                });
            }
            return;
        }

        Sentry.setUser(null);
        posthog.reset();
    }, [user]);

    return null;
}
