import type { IStorageAdapter } from './storage.interface';
import { AUTH_STORAGE_KEYS } from './constants';

function checkBrowser(): void {
    if (typeof localStorage === 'undefined') {
        throw new Error(
            'LocalStorageAdapter is not available in this environment. Use AsyncStorageAdapter for React Native.',
        );
    }
}

export class LocalStorageAdapter implements IStorageAdapter {
    async getToken(): Promise<string | null> {
        checkBrowser();
        return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    }

    async setToken(token: string): Promise<void> {
        checkBrowser();
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    }

    async removeToken(): Promise<void> {
        checkBrowser();
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    }

    async checkToken(): Promise<boolean> {
        checkBrowser();
        return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) !== null;
    }

    async getUserId(): Promise<string | null> {
        checkBrowser();
        return localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
    }

    async setUserId(id: string): Promise<void> {
        checkBrowser();
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, id);
    }

    async storeAuth(
        token: string,
        userId: string,
        userType: string,
        email: string,
        businessType?: string,
    ): Promise<void> {
        checkBrowser();
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, userId);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_TYPE, userType);
        localStorage.setItem(AUTH_STORAGE_KEYS.EMAIL, email);
        if (businessType) {
            localStorage.setItem(AUTH_STORAGE_KEYS.BUSINESS_TYPE, businessType);
        }
    }

    async clearAuth(): Promise<void> {
        checkBrowser();
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER_ID);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER_TYPE);
        localStorage.removeItem(AUTH_STORAGE_KEYS.EMAIL);
        localStorage.removeItem(AUTH_STORAGE_KEYS.BUSINESS_TYPE);
    }

    async clear(): Promise<void> {
        await this.clearAuth();
    }
}
