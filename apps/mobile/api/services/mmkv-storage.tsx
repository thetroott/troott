import { MMKV } from 'react-native-mmkv';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { StateStorage } from '@/lib/zstore';
import secureStorage from './secure-storage';

export interface ISetData {
    key: string;
    payload: string | object;
}

export interface IGetData {
    key: string;
    parse?: boolean;
}

const memoryKv = new Map<string, string>();

function createMemoryMmkv(): MMKV {
    const inst = {
        set: (key: string, value: boolean | string | number | Uint8Array) => {
            memoryKv.set(
                key,
                typeof value === 'string' ? value : String(value),
            );
        },
        getString: (key: string) => memoryKv.get(key),
        delete: (key: string) => {
            memoryKv.delete(key);
        },
        contains: (key: string) => memoryKv.has(key),
        clearAll: () => memoryKv.clear(),
        getAllKeys: () => [...memoryKv.keys()],
    };
    return inst as MMKV;
}

let _mmkvSingleton: MMKV | null = null;
let _mmkvInitFailed = false;

/**
 * Shared MMKV instance (or in-memory fallback when JSI/MMKV is unavailable, e.g. remote debugging).
 */
export function getMMKV(): MMKV {
    if (_mmkvInitFailed) {
        return _mmkvSingleton as MMKV;
    }
    if (_mmkvSingleton !== null) return _mmkvSingleton;
    try {
        _mmkvSingleton = new MMKV();
        return _mmkvSingleton;
    } catch {
        _mmkvInitFailed = true;
        _mmkvSingleton = createMemoryMmkv();
        if (__DEV__) {
            console.warn(
                '[mmkv-storage] MMKV unavailable (e.g. Chrome remote debugging); using in-memory storage for this JS session.',
            );
        }
        return _mmkvSingleton;
    }
}

/**
 * Drop-in MMKV instance (same role as the old `storage` export from `mmkv-client`).
 * Distinct from {@link storage} auth/session helpers below.
 */
const mmkv = new Proxy({} as MMKV, {
    get(_, prop) {
        const inst = getMMKV();
        return (inst as unknown as Record<string, unknown>)[prop as string];
    },
});

const storageFunctions = {
    setItem: (key: string, value: string) => {
        getMMKV().set(key, value);
    },
    getItem: (key: string) => {
        const value = getMMKV().getString(key);
        return value === undefined ? null : value;
    },
    removeItem: (key: string) => {
        getMMKV().delete(key);
    },
};

const mmkvStorageFunctions: StateStorage = {
    setItem: (key: string, value: string) => {
        getMMKV().set(key, value);
    },
    getItem: (key: string) => {
        const value = getMMKV().getString(key);
        return value === undefined ? null : value;
    },
    removeItem: (key: string) => {
        getMMKV().delete(key);
    },
};

const queryClientPersister = createSyncStoragePersister({
    storage: storageFunctions,
});

const stateStorage: StateStorage = storageFunctions;

const mmkvStateStorage: StateStorage = mmkvStorageFunctions;

/** MMKV helpers matching the legacy `mmkv-storage` service shape (used by auth + request config). */
const mmkvstorage = {
    async setData(data: ISetData): Promise<void> {
        const { key, payload } = data;
        const value =
            typeof payload === 'object'
                ? JSON.stringify(payload)
                : String(payload);
        getMMKV().set(key, value);
    },

    async getData(data: IGetData): Promise<unknown> {
        const { key, parse = false } = data;
        const value = getMMKV().getString(key);
        if (!value) return null;
        if (parse) {
            try {
                return JSON.parse(value) as unknown;
            } catch {
                return value;
            }
        }
        return value;
    },

    async checkData(key: string): Promise<boolean> {
        return getMMKV().contains(key);
    },

    async removeData(key: string): Promise<void> {
        getMMKV().delete(key);
    },
};

/** Persists the access token in Keychain-backed secure storage and MMKV (sync mirror for headers / checks). */
export async function storeToken(params: { token: string }): Promise<void> {
    const { token } = params;
    await secureStorage.setData({ key: 'token', payload: token });
    await mmkvstorage.setData({ key: 'token', payload: token });
}

/** Removes the access token from secure storage and MMKV. */
export async function clearTokens(): Promise<void> {
    await secureStorage.removeData({ key: 'token' });
    await mmkvstorage.removeData('token');
}

export enum HeaderType {
    IDEMPOTENT = 'Idempotent-Key',
}

// Config functions
const getConfig = () => {
    const config = {
        headers: {
            ContentType: 'application/json',
            lg: 'en',
            ch: 'web',
        },
    };

    return config;
};

const getConfigWithBearer = async () => {
    const token = await getToken();
    const { default: idempotent } = await import('./idempotent');
    const idemKey = await idempotent.getRequestKey();

    const config: any = {
        headers: {
            ContentType: 'application/json',
            Authorization: `Bearer ${token}`,
            lg: 'en',
            ch: 'web',
        },
    };

    config.headers[HeaderType.IDEMPOTENT] = idemKey;

    return config;
};

// Store auth
const storeAuth = (token: string, userId: string) => {
    mmkvstorage.setData({ key: 'token', payload: token });
    mmkvstorage.setData({ key: 'userId', payload: userId });

    secureStorage.setData({ key: 'token', payload: token });
    secureStorage.setData({ key: 'userId', payload: userId });
};

const clearAuth = async (): Promise<void> => {
    // First check if token and userId exist in MMKV
    const hasToken = await getToken();
    const hasUserId = await getUserId();

    if (hasToken && hasUserId) {
        // Remove from MMKV (sync)
        mmkvstorage.removeData('token');
        mmkvstorage.removeData('userId');
        mmkvstorage.removeData('userType');
        mmkvstorage.removeData('userEmail');

        // Remove from SecureStore (async)
        await secureStorage.removeData({ key: 'token' });
        await secureStorage.removeData({ key: 'userId' });
        await secureStorage.removeData({ key: 'userType' });
        await secureStorage.removeData({ key: 'userEmail' });
    }
};

// Setters
const setUserType = (userType: string): Promise<void> =>
    mmkvstorage.setData({ key: 'userType', payload: userType });

const setToken = (token: string): Promise<void> => storeToken({ token });

const setUserId = (userId: string): Promise<void> =>
    mmkvstorage.setData({ key: 'userId', payload: userId });

const setUserEmail = (userEmail: string): Promise<void> =>
    mmkvstorage.setData({ key: 'userEmail', payload: userEmail });

// Getters
const getUserType = async (): Promise<string> => {
    const v = await mmkvstorage.getData({ key: 'userType', parse: false });
    return typeof v === 'string' ? v : '';
};

const getToken = async (): Promise<string> => {
    const v = await secureStorage.getData({ key: 'token', parse: false });
    return typeof v === 'string' ? v : '';
};

/** True when JWT `exp` is past (or no token); false for opaque/non-JWT tokens without `exp`. */
export async function isTokenExpired(): Promise<boolean> {
    const token = await getToken();
    if (!token) return true;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json =
            typeof atob !== 'undefined'
                ? atob(b64)
                : Buffer.from(b64, 'base64').toString('utf8');
        const payload = JSON.parse(json) as { exp?: number };
        if (typeof payload.exp !== 'number') return false;
        return Date.now() >= payload.exp * 1000;
    } catch {
        return false;
    }
}

const getUserId = async (): Promise<string> => {
    const v = await mmkvstorage.getData({ key: 'userId', parse: false });
    return typeof v === 'string' ? v : '';
};

const getUserEmail = async (): Promise<string> => {
    const v = await mmkvstorage.getData({ key: 'userEmail', parse: false });
    return typeof v === 'string' ? v : '';
};

// Checkers
const checkToken = (): Promise<boolean> =>
    mmkvstorage.checkData('token') ?? false;

const checkUserEmail = (): Promise<boolean> =>
    mmkvstorage.checkData('userEmail') ?? false;

const checkUserId = (): Promise<boolean> =>
    mmkvstorage.checkData('userId') ?? false;

const checkUserType = (): Promise<boolean> =>
    mmkvstorage.checkData('userType') ?? false;

// Export storage
const storage = {
    getConfig,
    getConfigWithBearer,
    storeAuth,
    clearAuth,
    setUserType,
    setToken,
    setUserId,
    setUserEmail,
    getUserType,
    getToken,
    getUserId,
    getUserEmail,
    checkToken,
    checkUserEmail,
    checkUserId,
    checkUserType,
};

export {
    storage,
    getToken,
    mmkv,
    queryClientPersister,
    stateStorage,
    mmkvStateStorage,
};
export default storage;
