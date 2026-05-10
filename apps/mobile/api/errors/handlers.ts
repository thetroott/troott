/**
 * Error Handlers
 * 
 * Error handling utilities and logic.
 */

import Bugsnag from '@bugsnag/expo';
import { apiConfig } from '../config';
import { ApiError, ApiErrorType } from './types';

/**
 * Determine error type from HTTP status code
 */
export const getErrorTypeFromStatus = (statusCode: number): ApiErrorType => {
  switch (statusCode) {
    case 401:
      return ApiErrorType.UNAUTHORIZED;
    case 403:
      return ApiErrorType.FORBIDDEN;
    case 404:
      return ApiErrorType.NOT_FOUND;
    case 400:
    case 422:
      return ApiErrorType.VALIDATION;
    case 500:
    case 502:
    case 503:
    case 504:
      return ApiErrorType.SERVER;
    default:
      return ApiErrorType.UNKNOWN;
  }
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: ApiError): boolean => {
  // Don't retry client errors (4xx) except for network/timeout
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return false;
  }

  // Retry server errors (5xx) and network errors
  return (
    error.type === ApiErrorType.NETWORK ||
    error.type === ApiErrorType.TIMEOUT ||
    error.type === ApiErrorType.SERVER ||
    (error.statusCode !== undefined && error.statusCode >= 500)
  );
};

/**
 * Calculate retry delay with exponential backoff
 */
export const getRetryDelay = (attempt: number, baseDelay = 1000): number => {
  // Exponential backoff: 1s, 2s, 4s
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
};

/**
 * Log error to Bugsnag with context
 */
export const logError = (
  error: Error | ApiError,
  context?: {
    endpoint?: string;
    method?: string;
    requestData?: unknown;
    userId?: string;
  }
): void => {
  // Only log to Bugsnag in production/staging
  if (apiConfig.enableLogging) {
    Bugsnag.notify(error, (event) => {
      // Add context metadata
      if (context) {
        event.addMetadata('request', {
          endpoint: context.endpoint,
          method: context.method,
          requestData: context.requestData,
        });

        if (context.userId) {
          event.setUser(context.userId);
        }
      }

      // Add error-specific metadata for ApiError
      if (error instanceof ApiError) {
        event.addMetadata('apiError', {
          type: error.type,
          statusCode: error.statusCode,
          response: error.response,
        });

        // Set severity based on error type
        if (error.type === ApiErrorType.SERVER) {
          event.severity = 'error';
        } else if (error.type === ApiErrorType.UNAUTHORIZED) {
          event.severity = 'warning';
        } else {
          event.severity = 'info';
        }
      }
    });
  }
};

