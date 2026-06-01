import cookieService from '@/api/services/cookies';
import storage from '@/api/services/local-storage';
import { clearGetStartedLocalStorage } from '@/utils/get-started-local-storage.util';

/** Dispatched when JWT is invalid or user no longer exists (feat-0009). */
export const SESSION_INVALID_EVENT = 'troott:session-invalid';

export type SessionInvalidDetail = {
    reason?: string;
};

/** Clears local session without calling the API. */
export function clearLocalAuth(): void {
    clearGetStartedLocalStorage();
    storage.clearAuth();
    cookieService.removeData({ key: 'userType' });
    cookieService.removeData({ key: 'token' });
    cookieService.removeData({ key: 'userID' });
    cookieService.removeData({ key: 'email' });
    cookieService.removeData({ key: 'businessType' });
}

/** Clears portal session and notifies headless routers to send the user to login. */
export function invalidateStaleSession(reason?: string): void {
    clearLocalAuth();
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent<SessionInvalidDetail>(SESSION_INVALID_EVENT, {
                detail: { reason },
            }),
        );
    }
}

export function isUnauthorizedApiStatus(status: unknown): boolean {
    return status === 401 || status === 403;
}
