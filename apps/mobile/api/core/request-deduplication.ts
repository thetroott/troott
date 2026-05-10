/**
 * Request Deduplication
 * 
 * Prevents duplicate concurrent requests by caching in-flight requests.
 */

import { RequestConfig } from '../client';
import { apiConfig, features } from '../config';

/**
 * Request cache for deduplication
 */
const requestCache = new Map<string, Promise<Response>>();

/**
 * Create request key for deduplication
 */
export const createRequestKey = (url: string, config: RequestConfig): string => {
  const method = config.method || 'GET';
  const body = config.body ? JSON.stringify(config.body) : '';
  return `${method}:${url}:${body}`;
};

/**
 * Get cached request if available
 */
export const getCachedRequest = (key: string): Promise<Response> | undefined => {
  return requestCache.get(key);
};

/**
 * Cache a request promise
 */
export const cacheRequest = (key: string, promise: Promise<Response>): void => {
  requestCache.set(key, promise);
};

/**
 * Remove request from cache
 */
export const removeCachedRequest = (key: string): void => {
  requestCache.delete(key);
};

/**
 * Check if request deduplication is enabled and should be used
 */
export const shouldDeduplicate = (config: RequestConfig): boolean => {
  return features.requestDeduplication && config.method === 'GET';
};

/**
 * Log deduplication event
 */
export const logDeduplication = (key: string): void => {
  if (apiConfig.enableLogging) {
    console.log(`Deduplicating request: ${key}`);
  }
};

