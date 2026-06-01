import cookieService from '@/api/services/cookies';
import { useCallback } from 'react';
import useGoTo from '../shared/useGoTo';
import storage from '@/api/services/local-storage';
import useContextType from '../shared/useContextType';
import { UserType } from '@/models/User.model';
import { useSession } from '@/context/session/sessionState';
import { useMinister } from '@/context/minister/useMinister';
import { useStudio } from '@/context/studio/useStudio';
import {
    isAdminPortalRole,
    isStudioContentRole,
} from '@/utils/roles.util';
import { useCreator } from '@/context/creator/useCreator';
import { isStudioOnboardingComplete } from '@/utils/portal-onboarding.util';
import { navigateToStudioPortal } from '@/utils/studio-portal.util';
import {
    PATH_ADMIN_PREFIX,
    PATH_GET_STARTED,
    PATH_LOGIN,
    PATH_SEG_ADMIN_USERS,
    PATH_UNAUTHORIZED,
} from '@/routes/paths';
import {
    canAccessReturnPath,
    isListenerLikeUserType,
    normalizeUserType,
    UNAUTHORIZED_REASON_LISTENER,
} from '@/utils/auth-redirect.util';

export type RedirectAfterAuthOptions = {
    userType?: string;
    token?: boolean;
    /** Deep link from `location.state.from` after login (AuthGate). */
    returnTo?: string;
};

/** Role-based home navigation after sign-in (feat-0001). */
export function useRedirectAfterAuth() {
    const { userContext } = useContextType();
    const { navigate } = useGoTo();
    const { refreshSession } = useSession();
    const { minister } = useMinister();
    const { creator } = useCreator();
    const { studioCode } = useStudio();

    return useCallback(
        async (options?: RedirectAfterAuthOptions) => {
            const replace = { replace: true as const };
            const hasToken =
                options?.token ??
                Boolean(storage.checkToken() && storage.checkUserID());

            if (!hasToken) {
                navigate(PATH_LOGIN, replace);
                return;
            }

            await refreshSession({ force: Boolean(options?.token) });

            if (!storage.checkToken() || !storage.checkUserID()) {
                navigate(PATH_LOGIN, replace);
                return;
            }

            const sessionUser = userContext.user as { userType?: string } | null;
            const ut = normalizeUserType(
                options?.userType ??
                    (sessionUser?.userType as string | undefined) ??
                    (cookieService.getUserType() || ''),
            );

            if (isListenerLikeUserType(ut)) {
                navigate(PATH_UNAUTHORIZED, {
                    ...replace,
                    state: { reason: UNAUTHORIZED_REASON_LISTENER },
                });
                return;
            }

            const returnTo = options?.returnTo;
            if (returnTo && canAccessReturnPath(ut, returnTo)) {
                navigate(returnTo, replace);
                return;
            }

            if (isAdminPortalRole(ut)) {
                navigate(`${PATH_ADMIN_PREFIX}/${PATH_SEG_ADMIN_USERS}`, replace);
                return;
            }

            if (isStudioContentRole(ut)) {
                const sessionUserFull = userContext.user as {
                    userType?: string;
                    onboard?: { status?: string };
                } | null;
                if (
                    !isStudioOnboardingComplete(
                        ut,
                        minister,
                        sessionUserFull,
                        creator,
                    )
                ) {
                    navigate(PATH_GET_STARTED, replace);
                    return;
                }
                await navigateToStudioPortal(
                    (path) => navigate(path, replace),
                    studioCode || undefined,
                );
                return;
            }

            navigate(PATH_UNAUTHORIZED, replace);
        },
        [navigate, refreshSession, userContext.user, minister, creator, studioCode],
    );
}
