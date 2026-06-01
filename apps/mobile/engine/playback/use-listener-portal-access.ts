import { useMemo } from 'react';
import { useContextType } from '@/context';
import { useUser } from '@/api/hooks/app/useUser';

/** Types accepted as listener-facing mobile app users (see ADR 0001 / profile module). */
const LISTENER_PORTAL_USER_TYPES = new Set(['listener', 'user']);

function normalizeUserType(raw: string | undefined): string {
    return String(raw ?? '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
}

function profileAllowsListener(profile: unknown): boolean {
    if (!profile || typeof profile !== 'object') return false;
    const p = profile as Record<string, unknown>;
    if (p.kind === 'listener') return true;
    const ut = normalizeUserType(p.userType as string | undefined);
    return LISTENER_PORTAL_USER_TYPES.has(ut);
}

/**
 * Listener mobile shell: eligible when profile (or cached user type) indicates a listener account.
 * Internal portal roles should use the web app instead.
 */
export function useListenerPortalAccess() {
    const { userContext } = useContextType();
    const cachedUser = userContext.user as { id?: string; userType?: string } | null;
    const persistedType = userContext.userType;
    const cachedType = normalizeUserType(
        (cachedUser?.userType as string | undefined) ?? persistedType,
    );

    const profileQuery = useUser().useCurrentUserQuery(false);

    return useMemo(() => {
        const profile = profileQuery.data;
        const fromProfile = profileAllowsListener(profile);
        const fromStore =
            LISTENER_PORTAL_USER_TYPES.has(cachedType) && cachedType !== '';

        const isEligible = fromProfile || fromStore;
        const profileUt = normalizeUserType(
            (profile as { userType?: string } | undefined)?.userType,
        );
        const isInternalLike =
            profileUt === 'minister' ||
            cachedType === 'minister' ||
            cachedType === 'admin' ||
            cachedType === 'super-admin' ||
            cachedType === 'creator';

        return {
            /** Listener / generic user roles intended for this app. */
            isEligible,
            /** Suggest switching to web when the account looks like an internal portal role. */
            isWrongApp: isInternalLike && !isEligible,
            isLoading: profileQuery.isLoading,
            isError: profileQuery.isError,
            error: profileQuery.error,
            refetch: profileQuery.refetch,
        };
    }, [
        cachedType,
        profileQuery.data,
        profileQuery.error,
        profileQuery.isError,
        profileQuery.isLoading,
        profileQuery.refetch,
    ]);
}
