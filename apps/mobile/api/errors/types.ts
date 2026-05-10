/**
 * Error Types
 * 
 * Type definitions for API errors.
 */

/**
 * API Error types
 */
export enum ApiErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * API Error response structure (matches Trifold API format)
 */
export interface ApiErrorResponse {
  status: 'fail' | 'error';
  message?: string;
  errors?: {
    message: string;
    field?: string;
  }[];
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode?: number;
  public readonly response?: ApiErrorResponse;
  public readonly originalError?: Error;

  constructor(
    message: string,
    type: ApiErrorType,
    statusCode?: number,
    response?: ApiErrorResponse,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.response = response;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

