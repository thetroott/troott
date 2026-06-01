import { useEffect, useState } from 'react';
import cookieService from '@/api/services/cookies';
import storage from '@/api/services/local-storage';
import useGoTo from '@/hooks/shared/useGoTo';
import useContextType from '@/hooks/shared/useContextType';
import {
    clearLocalAuth,
    SESSION_INVALID_EVENT,
} from '@/utils/auth-session.util';
import {
    isAuthEntryRedirectPath,
    isAuthPublicPath,
    PATH_LOGIN,
} from '@/routes/paths';
import { useRedirectAfterAuth } from '@/hooks/app/useRedirectAfterAuth';

/**
 * Headless session routing (no UI). Replaces AuthRootRedirect side effects.
 * Per-route loading skeletons live on individual pages, not here.
 */
export function AuthSessionRouting() {
    const { navigate, location } = useGoTo();
    const { userContext } = useContextType();
    const { setUserType, currentSidebar } = userContext;
    const redirectAfterAuth = useRedirectAfterAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const ut = cookieService.getUserType();
        setUserType(ut ? ut : '');
    }, [setUserType]);

    useEffect(() => {
        const onSessionInvalid = () => {
            navigate(PATH_LOGIN, { replace: true });
        };
        window.addEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
        return () => {
            window.removeEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
        };
    }, [navigate]);

    useEffect(() => {
        if (!storage.checkToken() || !storage.checkUserID()) {
            if (!isAuthPublicPath(location.pathname)) {
                clearLocalAuth();
                navigate(PATH_LOGIN, {
                    replace: true,
                    state: { from: location.pathname },
                });
            }
            return;
        }

        setIsLoggedIn(true);
        currentSidebar(false);

        if (isAuthEntryRedirectPath(location.pathname)) {
            const from =
                typeof location.state === 'object' &&
                location.state !== null &&
                'from' in location.state
                    ? String(
                          (location.state as { from?: string }).from ?? '',
                      )
                    : undefined;
            void redirectAfterAuth({ returnTo: from });
        }
    }, [
        location.pathname,
        location.state,
        navigate,
        currentSidebar,
        redirectAfterAuth,
        isLoggedIn,
    ]);

    useEffect(() => {
        const ut = cookieService.getUserType();
        setUserType(ut ? ut : '');
    }, [isLoggedIn, setUserType]);

    return null;
}
