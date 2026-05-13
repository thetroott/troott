/**
 * Request/Response Interceptors
 * 
 * Handles request preparation and response processing.
 */

import { RequestConfig } from '../client';
import { apiConfig, DEFAULT_API_REQUEST_HEADERS } from '../config';
import { ApiError, ApiErrorType, getErrorTypeFromStatus, logError } from '../errors';
import { clearTokens, getToken, isTokenExpired } from '../storage/auth';
import { storage as sessionStorage } from '../storage/session-storage';

/**
 * Prepare request headers with authentication
 */
export const prepareRequestHeaders = async (
  config: RequestConfig
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...DEFAULT_API_REQUEST_HEADERS,
    ...(config.headers as Record<string, string>),
  };

  // Add authentication token if not skipped (SecureStore first, then MMKV session)
  if (!config.skipAuth) {
    let token = await getToken();
    if (!token) {
      const mmkv = await sessionStorage.getToken();
      if (mmkv) token = mmkv;
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle authentication errors (401)
 */
export const handleAuthError = async (response: Response, skipAuth: boolean): Promise<void> => {
  if (response.status === 401 && !skipAuth) {
    const token = await getToken();
    if (token && (await isTokenExpired())) {
      // Token expired, clear it and let the app handle re-authentication
      await clearTokens();
      throw new ApiError(
        'Authentication token expired',
        ApiErrorType.UNAUTHORIZED,
        401
      );
    }
  }
};

/**
 * Process API response
 */
export const processResponse = async <T>(
  response: Response,
  url: string,
  config: RequestConfig
): Promise<T> => {
  // Log request/response in development
  if (apiConfig.enableLogging) {
    console.log(`[API] ${config.method || 'GET'} ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  // Handle non-JSON responses (e.g., file downloads)
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(
        `Request failed: ${response.statusText}`,
        getErrorTypeFromStatus(response.status),
        response.status
      );
    }
    return response as unknown as T;
  }

  // Parse JSON response
  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError(
      'Invalid JSON response',
      ApiErrorType.UNKNOWN,
      response.status,
      undefined,
      error instanceof Error ? error : undefined
    );
  }

  // Handle error responses
  if (!response.ok) {
    const errorResponse = data as {
      status?: 'fail' | 'error' | string;
      message?: string;
      errors?: { message: string; field?: string }[];
    };

    const errorType = getErrorTypeFromStatus(response.status);
    const errorMessage = errorResponse.message || response.statusText;

    const apiError = new ApiError(
      errorMessage,
      errorType,
      response.status,
      {
        status: (errorResponse.status === 'fail' || errorResponse.status === 'error') 
          ? errorResponse.status 
          : 'error',
        message: errorMessage,
        errors: errorResponse.errors,
      }
    );

    // Log error (unless skipped)
    if (!config.skipErrorLogging) {
      logError(apiError, {
        endpoint: url,
        method: config.method || 'GET',
      });
    }

    throw apiError;
  }

  // Handle success response
  const responseData = data as { data?: T; status?: string };
  
  // Return data if wrapped in { data: ... } structure, otherwise return the whole response
  // This allows extractData in services to handle the extraction consistently
  return responseData as T;
};

