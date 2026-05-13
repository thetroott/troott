/**
 * TanStack Query cache persistence via MMKV (sync I/O wrapped in async Persister API).
 */

import { PersistedClient, Persister } from '@tanstack/query-persist-client-core';

import { getMMKV } from './mmkv-client';

const CACHE_KEY = 'trifold-query-cache';

export const createMMKVPersister = (): Persister => {
    return {
        persistClient: async (client: PersistedClient): Promise<void> => {
            try {
                const serialized = JSON.stringify(client);
                getMMKV().set(CACHE_KEY, serialized);
            } catch (error) {
                console.error('Failed to persist query cache:', error);
            }
        },
        restoreClient: async (): Promise<PersistedClient | undefined> => {
            try {
                const serialized = getMMKV().getString(CACHE_KEY);
                if (!serialized) {
                    return undefined;
                }
                return JSON.parse(serialized) as PersistedClient;
            } catch (error) {
                console.error('Failed to restore query cache:', error);
                try {
                    getMMKV().delete(CACHE_KEY);
                } catch {
                    // Ignore
                }
                return undefined;
            }
        },
        removeClient: async (): Promise<void> => {
            try {
                getMMKV().delete(CACHE_KEY);
            } catch (error) {
                console.error('Failed to remove query cache:', error);
            }
        },
    };
};

export const clearQueryCache = async (): Promise<void> => {
    try {
        getMMKV().delete(CACHE_KEY);
    } catch (error) {
        console.error('Failed to clear query cache:', error);
    }
};

export const getCacheSize = async (): Promise<number> => {
    try {
        const serialized = getMMKV().getString(CACHE_KEY);
        if (serialized) {
            return serialized.length;
        }
        return 0;
    } catch (error) {
        console.error('Failed to get cache size:', error);
        return 0;
    }
};
