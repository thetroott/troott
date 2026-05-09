import { MMKV } from 'react-native-mmkv';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { StateStorage } from '@/lib/zstore';

let _storage: MMKV | null = null;
function getMMKV(): MMKV {
    if (_storage !== null) return _storage;
    _storage = new MMKV();
    return _storage;
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
