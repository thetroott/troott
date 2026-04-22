import type { IStorageAdapter } from './storage.interface';
import { AUTH_STORAGE_KEYS } from './constants';

export interface IAsyncKeyValueStore {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}

export class AsyncStorageAdapter implements IStorageAdapter {
    private readonly store: IAsyncKeyValueStore;

    constructor(store: IAsyncKeyValueStore) {
        this.store = store;
    }

    async getToken(): Promise<string | null> {
        return this.store.getItem(AUTH_STORAGE_KEYS.TOKEN);
    }

    async setToken(token: string): Promise<void> {
        await this.store.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    }

    async removeToken(): Promise<void> {
        await this.store.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    }

    async checkToken(): Promise<boolean> {
        const token = await this.store.getItem(AUTH_STORAGE_KEYS.TOKEN);
        return token !== null;
    }

    async getUserId(): Promise<string | null> {
        return this.store.getItem(AUTH_STORAGE_KEYS.USER_ID);
    }

    async setUserId(id: string): Promise<void> {
        await this.store.setItem(AUTH_STORAGE_KEYS.USER_ID, id);
    }

    async storeAuth(
        token: string,
        userId: string,
        userType: string,
        email: string,
        businessType?: string,
    ): Promise<void> {
        await this.store.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
        await this.store.setItem(AUTH_STORAGE_KEYS.USER_ID, userId);
        await this.store.setItem(AUTH_STORAGE_KEYS.USER_TYPE, userType);
        await this.store.setItem(AUTH_STORAGE_KEYS.EMAIL, email);
        if (businessType) {
            await this.store.setItem(AUTH_STORAGE_KEYS.BUSINESS_TYPE, businessType);
        }
    }

    async clearAuth(): Promise<void> {
        await this.store.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        await this.store.removeItem(AUTH_STORAGE_KEYS.USER_ID);
        await this.store.removeItem(AUTH_STORAGE_KEYS.USER_TYPE);
        await this.store.removeItem(AUTH_STORAGE_KEYS.EMAIL);
        await this.store.removeItem(AUTH_STORAGE_KEYS.BUSINESS_TYPE);
    }

    async clear(): Promise<void> {
        await this.clearAuth();
    }
}
