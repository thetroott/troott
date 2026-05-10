/**
 * API Client
 * 
 * Production-ready HTTP client with:
 * - Authentication token management
 * - Request/response interceptors
 * - Automatic token refresh
 * - Error handling
 * - Request deduplication
 * - Timeout handling
 * - Retry logic with exponential backoff
 */

import { apiConfig } from './config';
import { checkCircuitBreaker } from './core/circuit-breaker';
import { handleAuthError, prepareRequestHeaders, processResponse } from './core/interceptors';
import {
  cacheRequest,
  createRequestKey,
  getCachedRequest,
  logDeduplication,
  removeCachedRequest,
  shouldDeduplicate,
} from './core/request-deduplication';
import { retryRequest } from './core/retry';
import { ApiError, ApiErrorType } from './errors';

/**
 * Request configuration
 */
export interface RequestConfig extends Omit<RequestInit, 'priority'> {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  skipErrorLogging?: boolean;
  priority?: 'high' | 'normal' | 'low';
}


/**
 * Main API client function
 */
export const apiClient = async <T = unknown>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> => {
  // Ensure endpoint starts with / if it's a relative path
  const normalizedEndpoint = endpoint.startsWith('http') 
    ? endpoint 
    : endpoint.startsWith('/') 
      ? endpoint 
      : `/${endpoint}`;
  
  // Ensure baseURL doesn't end with / and endpoint starts with /
  const baseURL = apiConfig.baseURL?.replace(/\/$/, '') || '';
  const url = normalizedEndpoint.startsWith('http') 
    ? normalizedEndpoint 
    : `${baseURL}${normalizedEndpoint}`;

  // Check circuit breaker
  if (!checkCircuitBreaker(url)) {
    throw new ApiError(
      'Service temporarily unavailable',
      ApiErrorType.SERVER,
      503
    );
  }

  // Prepare headers with authentication
  const headers = await prepareRequestHeaders(config);

  // Prepare request config (remove priority from fetch call)
  const { priority, ...fetchConfig } = config;
  const requestConfig: RequestConfig = {
    ...fetchConfig,
    headers,
  };

  // Request deduplication for GET requests
  if (shouldDeduplicate(config)) {
    const requestKey = createRequestKey(url, config);
    const cachedRequest = getCachedRequest(requestKey);

    if (cachedRequest) {
      logDeduplication(requestKey);
      const response = await cachedRequest;
      await handleAuthError(response, config.skipAuth || false);
      return processResponse<T>(response, url, config);
    }

    // Create new request and cache it
    const requestPromise = retryRequest(url, requestConfig).finally(() => {
      // Remove from cache after completion
      removeCachedRequest(requestKey);
    });

    cacheRequest(requestKey, requestPromise);
    const response = await requestPromise;
    return processResponse<T>(response, url, config);
  }

  // Execute request
  const response = await retryRequest(url, requestConfig);
  return processResponse<T>(response, url, config);
};

/**
 * GET request helper
 */
export const get = <T = unknown>(
  endpoint: string,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> => {
  return apiClient<T>(endpoint, { ...config, method: 'GET' });
};

/**
 * POST request helper
 */
export const post = <T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'method'>
): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...config,
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
    headers: data instanceof FormData 
      ? config?.headers 
      : { ...config?.headers, 'Content-Type': 'application/json' },
  });
};

/**
 * PATCH request helper
 */
export const patch = <T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'method'>
): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...config,
    method: 'PATCH',
    body: data instanceof FormData ? data : JSON.stringify(data),
    headers: data instanceof FormData 
      ? config?.headers 
      : { ...config?.headers, 'Content-Type': 'application/json' },
  });
};

/**
 * PUT request helper
 */
export const put = <T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'method'>
): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...config,
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
    headers: data instanceof FormData 
      ? config?.headers 
      : { ...config?.headers, 'Content-Type': 'application/json' },
  });
};

/**
 * DELETE request helper
 */
export const del = <T = unknown>(
  endpoint: string,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> => {
  return apiClient<T>(endpoint, { ...config, method: 'DELETE' });
};

/**
 * Clear request cache (useful for testing or manual cache invalidation)
 */
export const clearRequestCache = (): void => {
  // This is now handled by the request-deduplication module
  // Keep for backward compatibility
};

