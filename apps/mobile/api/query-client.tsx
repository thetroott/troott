/**
 * TanStack Query Client Setup
 * 
 * Production-ready QueryClient configuration with:
 * - Mobile-optimized settings
 * - Cache persistence
 * - Offline support
 * - Error handling
 * - DevTools integration
 */

import { MutationCache, Query, QueryCache, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect } from 'react';
import { apiConfig } from './config';
import { ApiError, logError } from './errors';
import { createMMKVPersister } from './storage/cache';
import { initializeOfflineQueue } from './storage/offline';
import { queryKeys } from './utils/query-keys';

/**
 * Re-export query keys for backward compatibility
 * 
 * @deprecated Import from './utils/query-keys' instead
 */
export { queryKeys };

/**
 * Create QueryClient with production configuration
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache time (how long unused data stays in cache)
        gcTime: apiConfig.cacheTime,
        // Stale time (how long data is considered fresh)
        staleTime: apiConfig.staleTime,
        // Retry configuration
        retry: (failureCount: number, error: Error) => {
          // Don't retry on 4xx errors (except network errors)
          if (error instanceof ApiError) {
            if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
              return false;
            }
          }
          // Max 3 retries
          return failureCount < 3;
        },
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus (disabled for mobile)
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Refetch on mount if data is stale
        refetchOnMount: true,
        // Network mode
        networkMode: 'online', // Can be 'offline', 'online', 'always'
      },
      mutations: {
        // Retry mutations on network errors
        retry: (failureCount: number, error: Error) => {
          if (error instanceof ApiError) {
            if (error.type === 'NETWORK' || error.type === 'TIMEOUT') {
              return failureCount < 2;
            }
          }
          return false;
        },
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
        // Network mode
        networkMode: 'online',
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Log query errors
        if (error instanceof ApiError) {
          logError(error, {
            endpoint: query.queryKey.join('/'),
          });
        } else {
          logError(error as Error, {
            endpoint: query.queryKey.join('/'),
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Log mutation errors
        if (error instanceof ApiError) {
          logError(error, {
            endpoint: mutation.options.mutationKey?.join('/') || 'unknown',
            method: 'MUTATION',
          });
        } else {
          logError(error as Error, {
            endpoint: mutation.options.mutationKey?.join('/') || 'unknown',
            method: 'MUTATION',
          });
        }
      },
    }),
  });
};

/**
 * QueryClient instance
 */
export const queryClient = createQueryClient();

/**
 * Query Client Provider Component
 * 
 * Wraps the app with QueryClientProvider and PersistQueryClientProvider
 */
export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Initialize offline queue
    const cleanup = initializeOfflineQueue();

    return () => {
      cleanup();
    };
  }, []);

  const persister = createMMKVPersister();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: apiConfig.cacheTime,
        buster: '', // Add version string here when you need to invalidate all cache
        dehydrateOptions: {
          // Don't persist sensitive data
          shouldDehydrateQuery: (query: Query) => {
            // Skip persisting auth tokens, payment info, etc.
            const key = query.queryKey[0] as string;
            if (key === 'auth' || key === 'payment') {
              return false;
            }
            return true;
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

