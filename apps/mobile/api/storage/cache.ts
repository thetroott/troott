/**
 * Cache Persistence with AsyncStorage
 * 
 * Cache persistence using AsyncStorage for React Native.
 * Works reliably with both on-device and remote debugging.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedClient, Persister } from '@tanstack/query-persist-client-core';

/**
 * Query cache storage key
 */
const CACHE_KEY = 'trifold-query-cache';

/**
 * Create persister for TanStack Query using AsyncStorage
 */
export const createMMKVPersister = (): Persister => {
  return {
    persistClient: async (client: PersistedClient): Promise<void> => {
      try {
        const serialized = JSON.stringify(client);
        await AsyncStorage.setItem(CACHE_KEY, serialized);
      } catch (error) {
        console.error('Failed to persist query cache:', error);
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const serialized = await AsyncStorage.getItem(CACHE_KEY);
        if (!serialized) return undefined;
        return JSON.parse(serialized) as PersistedClient;
      } catch (error) {
        console.error('Failed to restore query cache:', error);
        // Clear corrupted cache
        try {
          await AsyncStorage.removeItem(CACHE_KEY);
        } catch {
          // Ignore
        }
        return undefined;
      }
    },
    removeClient: async (): Promise<void> => {
      try {
        await AsyncStorage.removeItem(CACHE_KEY);
      } catch (error) {
        console.error('Failed to remove query cache:', error);
      }
    },
  };
};

/**
 * Clear query cache
 */
export const clearQueryCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear query cache:', error);
  }
};

/**
 * Get cache size (for debugging)
 */
export const getCacheSize = async (): Promise<number> => {
  try {
    const serialized = await AsyncStorage.getItem(CACHE_KEY);
    return serialized ? serialized.length : 0;
  } catch (error) {
    console.error('Failed to get cache size:', error);
    return 0;
  }
};

