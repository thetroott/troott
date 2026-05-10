/**
 * Retry Logic with Exponential Backoff
 * 
 * Handles request retries with exponential backoff strategy.
 */

import { getAdaptiveTimeout, getNetworkState } from '../../utils/network';
import { RequestConfig } from '../client';
import { apiConfig } from '../config';
import { ApiError, ApiErrorType, getRetryDelay, isRetryableError } from '../errors';
import { recordCircuitBreakerFailure } from './circuit-breaker';
import { fetchWithTimeout } from './fetch';
import { handleAuthError } from './interceptors';

/**
 * Retry request with exponential backoff
 */
export const retryRequest = async (
  url: string,
  config: RequestConfig,
  attempt = 0
): Promise<Response> => {
  // Extract our custom config options
  const { timeout, retries, skipAuth, skipErrorLogging, priority, ...fetchConfig } = config;
  const maxRetries = retries ?? apiConfig.retryAttempts;
  
  try {
    const networkState = await getNetworkState();
    const adaptiveTimeout = getAdaptiveTimeout(
      timeout ?? apiConfig.timeout,
      networkState.quality
    );

    const response = await fetchWithTimeout(url, fetchConfig, adaptiveTimeout);

    // Handle auth errors
    await handleAuthError(response, skipAuth || false);

    return response;
  } catch (error) {
    // Record failure for circuit breaker
    recordCircuitBreakerFailure(url);

    const apiError = error instanceof ApiError 
      ? error 
      : new ApiError(
          error instanceof Error ? error.message : 'Network error',
          ApiErrorType.NETWORK,
          undefined,
          undefined,
          error instanceof Error ? error : undefined
        );

    // Check if we should retry
    if (attempt < maxRetries && isRetryableError(apiError)) {
      const delay = getRetryDelay(attempt);
      
      if (apiConfig.enableLogging) {
        console.log(`Retrying request to ${url} (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms`);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(url, config, attempt + 1);
    }

    throw apiError;
  }
};

