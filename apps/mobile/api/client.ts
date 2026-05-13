/**
 * HTTP entrypoints (backward-compatible re-exports of {@link httpClient}).
 */

import { httpClient, RequestConfig } from './http-client';

export type { RequestConfig } from './http-client';
export { httpClient } from './http-client';

export const apiClient = <T = unknown>(
    endpoint: string,
    config: RequestConfig = {},
): Promise<T> => httpClient.request<T>(endpoint, config);

export const get = <T = unknown>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>,
): Promise<T> => httpClient.get<T>(endpoint, config);

export const post = <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'method'>,
): Promise<T> => httpClient.post<T>(endpoint, data, config);

export const patch = <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'method'>,
): Promise<T> => httpClient.patch<T>(endpoint, data, config);

export const put = <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'method'>,
): Promise<T> => httpClient.put<T>(endpoint, data, config);

export const del = <T = unknown>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>,
): Promise<T> => httpClient.del<T>(endpoint, config);

export const clearRequestCache = (): void => {
    // Deduplication cache is owned by httpClient; kept for API compatibility.
};
