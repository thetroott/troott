import { useMemo } from 'react';
import { useContextType } from '@/state/app-state';
import { INTERNAL_PORTAL_ROLES } from '@/utils/roles.util';

const INTERNAL_PORTAL_USER_TYPES = new Set<string>(
    INTERNAL_PORTAL_ROLES as string[],
);

function normalizeUserType(raw: string): string {
    return String(raw || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
}

/**
 * Gate for the web app: super-admin, admin, minister, creator. Listener-first
 * accounts should use the mobile app (`useListenerPortalAccess` on mobile).
 */
export function useInternalPortalAccess() {
    const { userContext } = useContextType();
    const persistedType = userContext.userType;
    const user = userContext.user as { userType?: string } | null;
    const effective = normalizeUserType(
        (user?.userType as string | undefined) ?? persistedType,
    );

    return useMemo(() => {
        const hasType = effective.length > 0;
        const isInternal =
            hasType && INTERNAL_PORTAL_USER_TYPES.has(effective);
        const isListenerLike =
            effective === 'listener' || effective === 'user';

        return {
            userType: effective,
            /** True when the account is intended for the web portal. */
            isEligible: isInternal,
            /** True for listener / generic user roles that belong on mobile. */
            isListenerLike,
            /** Loading unknown — store may hydrate after first paint. */
            isHydratingUserType: !hasType,
        };
    }, [effective]);
}
