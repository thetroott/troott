/**
 * Fetch Utilities
 * 
 * Fetch wrapper with timeout support.
 */

import { ApiError, ApiErrorType } from '../errors';

/**
 * Create fetch request with timeout
 */
export const fetchWithTimeout = async (
  url: string,
  config: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...config,
      signal: config.signal || controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', ApiErrorType.TIMEOUT);
    }
    throw error;
  }
};

