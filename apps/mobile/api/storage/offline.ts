/**
 * Offline Mutation Queue
 * 
 * Handles queuing mutations when offline and syncing when back online.
 * Includes conflict resolution and sync status tracking.
 */

import Bugsnag from '@bugsnag/expo';

import { apiClient } from '../client';
import { getMMKV } from './mmkv-client';
import { NetworkQuality, NetworkState, subscribeToNetworkState } from '@/utils/network';

/**
 * Mutation queue item
 */
export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: string;
  data: unknown;
  config?: unknown;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}

/** MMKV key for offline mutation queue */
const QUEUE_KEY = 'trifold-mutation-queue';

function readQueueJson(): string | undefined {
    return getMMKV().getString(QUEUE_KEY);
}

function writeQueueJson(serialized: string): void {
    getMMKV().set(QUEUE_KEY, serialized);
}

/**
 * Get all queued mutations
 */
export const getQueuedMutations = async (): Promise<QueuedMutation[]> => {
  try {
    const serialized = readQueueJson();
    if (!serialized) return [];
    return JSON.parse(serialized) as QueuedMutation[];
  } catch (error) {
    Bugsnag.notify(error as Error, (event) => {
      event.addMetadata('offline', { action: 'getQueuedMutations' });
    });
    return [];
  }
};

/**
 * Add mutation to queue
 */
export const queueMutation = async (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<string> => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const queuedMutation: QueuedMutation = {
    ...mutation,
    id,
    timestamp: Date.now(),
    retries: 0,
    status: 'pending',
  };

  const queue = await getQueuedMutations();
  queue.push(queuedMutation);
  writeQueueJson(JSON.stringify(queue));

  return id;
};

/**
 * Update mutation status
 */
export const updateMutationStatus = async (
  id: string,
  status: QueuedMutation['status'],
  error?: string
): Promise<void> => {
  const queue = await getQueuedMutations();
  const index = queue.findIndex((m) => m.id === id);
  
  if (index !== -1) {
    queue[index].status = status;
    if (error) {
      queue[index].error = error;
    }
    queue[index].retries += 1;
    writeQueueJson(JSON.stringify(queue));
  }
};

/**
 * Remove mutation from queue
 */
export const removeMutation = async (id: string): Promise<void> => {
  const queue = await getQueuedMutations();
  const filtered = queue.filter((m) => m.id !== id);
  writeQueueJson(JSON.stringify(filtered));
};

/**
 * Clear all completed mutations
 */
export const clearCompletedMutations = async (): Promise<void> => {
  const queue = await getQueuedMutations();
  const pending = queue.filter((m) => m.status !== 'completed');
  writeQueueJson(JSON.stringify(pending));
};

/**
 * Sync queued mutations when online
 */
export const syncQueuedMutations = async (): Promise<void> => {
  const queue = await getQueuedMutations();
  const pending = queue.filter((m) => m.status === 'pending' || m.status === 'failed');

  if (pending.length === 0) return;

  console.log(`Syncing ${pending.length} queued mutations...`);

  for (const mutation of pending) {
    try {
      await updateMutationStatus(mutation.id, 'syncing');

      // Execute the mutation
      const { priority, ...fetchConfig } = mutation.config as any;
      await apiClient(mutation.endpoint, {
        method: mutation.method as RequestInit['method'],
        body: mutation.data as BodyInit,
        ...fetchConfig,
      });

      await updateMutationStatus(mutation.id, 'completed');
      await removeMutation(mutation.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateMutationStatus(mutation.id, 'failed', errorMessage);

      // If retries exceeded, mark as failed permanently
      if (mutation.retries >= 3) {
        Bugsnag.notify(error as Error, (event) => {
          event.addMetadata('offline', {
            mutationId: mutation.id,
            endpoint: mutation.endpoint,
            retries: mutation.retries,
          });
        });
      }
    }
  }

  // Clean up completed mutations periodically
  await clearCompletedMutations();
};

/**
 * Initialize offline queue with network monitoring
 */
export const initializeOfflineQueue = (): (() => void) => {
  let isOnline = true;

  // Subscribe to network changes
  const unsubscribe = subscribeToNetworkState((state: NetworkState) => {
    const wasOnline = isOnline;
    isOnline = state.quality !== NetworkQuality.OFFLINE;

    // When coming back online, sync queued mutations
    if (!wasOnline && isOnline) {
      console.log('Network restored, syncing queued mutations...');
      syncQueuedMutations();
    }
  });

  // Initial sync if online
  if (isOnline) {
    syncQueuedMutations();
  }

  // Return cleanup function
  return () => {
    unsubscribe();
  };
};

/**
 * Get sync status
 */
export const getSyncStatus = async (): Promise<{
  pending: number;
  syncing: number;
  failed: number;
  total: number;
}> => {
  const queue = await getQueuedMutations();
  return {
    pending: queue.filter((m) => m.status === 'pending').length,
    syncing: queue.filter((m) => m.status === 'syncing').length,
    failed: queue.filter((m) => m.status === 'failed').length,
    total: queue.length,
  };
};

