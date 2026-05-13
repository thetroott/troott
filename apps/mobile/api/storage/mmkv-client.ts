import { MMKV } from 'react-native-mmkv';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { StateStorage } from '@/lib/zstore';

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

let _storage: MMKV | null = null;
let _mmkvFailed = false;

export function getMMKV(): MMKV {
    if (_mmkvFailed) {
        return _storage as MMKV;
    }
    if (_storage !== null) return _storage;
    try {
        _storage = new MMKV();
        return _storage;
    } catch {
        _mmkvFailed = true;
        _storage = createMemoryMmkv();
        if (__DEV__) {
            console.warn(
                '[storage] MMKV unavailable (e.g. Chrome remote debugging); using in-memory storage for this JS session.',
            );
        }
        return _storage;
    }
}

export const storage = new Proxy({} as MMKV, {
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

export const queryClientPersister = createSyncStoragePersister({
    storage: storageFunctions,
});

export const stateStorage: StateStorage = storageFunctions;

export const mmkvStateStorage: StateStorage = mmkvStorageFunctions;
