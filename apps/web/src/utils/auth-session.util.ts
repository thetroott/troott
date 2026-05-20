import cookieService from '@/api/services/cookies';
import storage from '@/api/services/local-storage';

/** Clears local session without calling the API. */
export function clearLocalAuth(): void {
    storage.clearAuth();
    cookieService.removeData({ key: 'userType' });
    cookieService.removeData({ key: 'token' });
    cookieService.removeData({ key: 'userID' });
    cookieService.removeData({ key: 'email' });
    cookieService.removeData({ key: 'businessType' });
}
