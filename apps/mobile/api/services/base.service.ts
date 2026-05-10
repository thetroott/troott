/**
 * Base Service
 * 
 * Abstract base class for all API services.
 * Provides common HTTP methods and error handling.
 */

import { apiClient, del, get, patch, post, put, RequestConfig } from '../client';
import { ApiResponse } from '../types';

/**
 * Base service class for API services
 */
export abstract class BaseService {
  /**
   * GET request
   */
  protected async get<T>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<T> {
    return get<T>(endpoint, config);
  }

  /**
   * POST request
   */
  protected async post<T>(
    endpoint: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<T> {
    return post<T>(endpoint, data, config);
  }

  /**
   * PATCH request
   */
  protected async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<T> {
    return patch<T>(endpoint, data, config);
  }

  /**
   * PUT request
   */
  protected async put<T>(
    endpoint: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<T> {
    return put<T>(endpoint, data, config);
  }

  /**
   * DELETE request
   */
  protected async delete<T>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<T> {
    return del<T>(endpoint, config);
  }

  /**
   * Generic API client call
   */
  protected async request<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    return apiClient<T>(endpoint, config);
  }

  /**
   * Extract data from API response wrapper
   * 
   * Extracts the `data` property from ApiResponse<T> if it exists,
   * otherwise returns the response as-is.
   */
  protected extractData<T>(response: ApiResponse<T> | T): T {
    // Check if response has the ApiResponse structure with a data property
    if (response && typeof response === 'object' && 'data' in response) {
      const apiResponse = response as ApiResponse<T>;
      // Return the data property if it exists, otherwise return the whole response
      return (apiResponse.data ?? response) as T;
    }
    // Return response as-is if it doesn't have the ApiResponse structure
    return response as T;
  }
}

