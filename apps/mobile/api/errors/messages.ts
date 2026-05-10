/**
 * Error Messages
 * 
 * User-friendly error messages.
 */

import { ApiError, ApiErrorType } from './types';

/**
 * Create user-friendly error message
 */
export const getUserFriendlyMessage = (error: ApiError): string => {
  // If API provided a user-friendly message, use it
  if (error.response?.message) {
    return error.response.message;
  }

  // If there are field-specific errors, combine them
  if (error.response?.errors && error.response.errors.length > 0) {
    return error.response.errors.map((e) => e.message).join(', ');
  }

  // Fallback to type-based messages
  switch (error.type) {
    case ApiErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ApiErrorType.TIMEOUT:
      return 'Request timed out. Please try again.';
    case ApiErrorType.UNAUTHORIZED:
      return 'Your session has expired. Please sign in again.';
    case ApiErrorType.FORBIDDEN:
      return 'You do not have permission to perform this action.';
    case ApiErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ApiErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ApiErrorType.SERVER:
      return 'Server error occurred. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

