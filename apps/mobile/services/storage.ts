import { MMKV } from 'react-native-mmkv';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { AsyncStorage as TanstackAsyncStorage } from '@tanstack/react-query-persist-client';
import { StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

let _storage: MMKV | null = null;
/** After a failed init, do not call `new MMKV()` again (avoids log spam / crashes). */
let _mmkvInitFailed = false;

const memoryPersistStore = new Map<string, string>();

const memoryStateStorage: StateStorage = {
    setItem: (key, value) => {
        memoryPersistStore.set(key, value);
    },
    getItem: (key) => memoryPersistStore.get(key) ?? null,
    removeItem: (key) => {
        memoryPersistStore.delete(key);
    },
};

function getMMKV(): MMKV | null {
    if (_mmkvInitFailed) return null;
    if (_storage !== null) return _storage;
    try {
        _storage = new MMKV();
        return _storage;
    } catch (e) {
        _mmkvInitFailed = true;
        console.warn(
            '[storage] MMKV unavailable (remote Chrome debugger, or JSI not ready). Using in-memory Zustand persist for this session. Disable remote JS debugging to use MMKV.',
            e,
        );
        return null;
    }
}

export const storage = new Proxy({} as MMKV, {
    get(_, prop) {
        const inst = getMMKV();
        if (inst)
            return (inst as unknown as Record<string, unknown>)[prop as string];
        return undefined;
    },
});

const storageFunctions = {
    setItem: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
    },
    getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        return value === undefined ? null : value;
    },
    removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
    },
};

const mmkvStorageFunctions: StateStorage = {
    setItem: (key: string, value: string) => {
        const inst = getMMKV();
        if (inst) inst.set(key, value);
        else memoryStateStorage.setItem(key, value);
    },
    getItem: (key: string) => {
        const inst = getMMKV();
        if (inst) {
            const value = inst.getString(key);
            return value === undefined ? null : value;
        }
        return memoryStateStorage.getItem(key);
    },
    removeItem: (key: string) => {
        const inst = getMMKV();
        if (inst) inst.delete(key);
        else memoryStateStorage.removeItem(key);
    },
};

const clientStorage: TanstackAsyncStorage<string> = storageFunctions;

export const queryClientPersister = createAsyncStoragePersister({
    storage: clientStorage,
});

export const stateStorage: StateStorage = storageFunctions;

export const mmkvStateStorage: StateStorage = mmkvStorageFunctions;
