import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cookieService from '@/api/services/cookies';
import storage from '@/api/services/local-storage';
import { AUTH_ROUTES } from '@/constants/auth-routes';
import {
    isStudioPortalUserType,
    navigateToStudioPortal,
} from '@/utils/studio-portal.util';

/**
 * `/` — guests go to login; signed-in users go to dashboard or studio.
 */
export function AuthRootRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!storage.checkToken() || !storage.checkUserID()) {
            navigate(AUTH_ROUTES.login, { replace: true });
            return;
        }

        const ut = cookieService.getUserType();
        if (isStudioPortalUserType(ut)) {
            void navigateToStudioPortal(navigate);
            return;
        }

        navigate('/dashboard', { replace: true });
    }, [navigate]);

    return null;
}
