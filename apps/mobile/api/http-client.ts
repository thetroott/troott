/**
 * Troott HTTP transport: single class owning URL build, headers, retries,
 * deduplication, circuit breaker, and response handling.
 */

import {
    apiConfig,
    DEFAULT_API_REQUEST_HEADERS,
    features,
} from './config/index';
import {
    ApiError,
    ApiErrorType,
    getErrorTypeFromStatus,
    getRetryDelay,
    isRetryableError,
    logError,
} from './errors';
import { DeviceEventEmitter } from 'react-native';
import { clearTokens, getToken, storeToken } from './services/mmkv-storage';
import { getAdaptiveTimeout, getNetworkState } from '@/lib/state/network-store';

const SESSION_INVALID_EVENT = 'troott:session-invalid';

type SessionInvalidPayload = {
    message?: string;
    status?: number;
};

function emitSessionInvalid(message?: string, status?: number): void {
    DeviceEventEmitter.emit(SESSION_INVALID_EVENT, {
        ...(message ? { message } : {}),
        ...(status != null ? { status } : {}),
    });
}

export interface RequestConfig extends Omit<RequestInit, 'priority'> {
    timeout?: number;
    retries?: number;
    skipAuth?: boolean;
    skipErrorLogging?: boolean;
    priority?: 'high' | 'normal' | 'low';
}

interface CircuitBreakerState {
    failures: number;
    lastFailureTime: number;
    isOpen: boolean;
}

const CIRCUIT_BREAKER_CONFIG = {
    failureThreshold: 5,
    resetTimeout: 60000,
};

export class TroottHttpClient {
    private static circuitBreakers = new Map<string, CircuitBreakerState>();

    private static requestCache = new Map<string, Promise<Response>>();

    private checkCircuitBreaker(url: string): boolean {
        if (!features.circuitBreaker) {
            return true;
        }

        const state = TroottHttpClient.circuitBreakers.get(url);
        if (!state) {
            return true;
        }

        if (state.isOpen) {
            const timeSinceLastFailure = Date.now() - state.lastFailureTime;
            if (timeSinceLastFailure > CIRCUIT_BREAKER_CONFIG.resetTimeout) {
                TroottHttpClient.circuitBreakers.delete(url);
                return true;
            }
            return false;
        }

        return true;
    }

    private recordCircuitBreakerFailure(url: string): void {
        if (!features.circuitBreaker) {
            return;
        }

        const state = TroottHttpClient.circuitBreakers.get(url) || {
            failures: 0,
            lastFailureTime: 0,
            isOpen: false,
        };

        state.failures += 1;
        state.lastFailureTime = Date.now();

        if (state.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
            state.isOpen = true;
        }

        TroottHttpClient.circuitBreakers.set(url, state);
    }

    private createRequestKey(url: string, config: RequestConfig): string {
        const method = config.method || 'GET';
        const body = config.body ? JSON.stringify(config.body) : '';
        return `${method}:${url}:${body}`;
    }

    private getCachedRequest(key: string): Promise<Response> | undefined {
        return TroottHttpClient.requestCache.get(key);
    }

    private cacheRequest(key: string, promise: Promise<Response>): void {
        TroottHttpClient.requestCache.set(key, promise);
    }

    private removeCachedRequest(key: string): void {
        TroottHttpClient.requestCache.delete(key);
    }

    private shouldDeduplicate(config: RequestConfig): boolean {
        return features.requestDeduplication && config.method === 'GET';
    }

    private logDeduplication(key: string): void {
        if (apiConfig.enableLogging) {
            console.log(`Deduplicating request: ${key}`);
        }
    }

    private normalizeUrl(endpoint: string): string {
        const normalizedEndpoint = endpoint.startsWith('http')
            ? endpoint
            : endpoint.startsWith('/')
              ? endpoint
              : `/${endpoint}`;

        const baseURL = apiConfig.baseURL?.replace(/\/$/, '') || '';
        if (normalizedEndpoint.startsWith('http')) {
            return normalizedEndpoint;
        }
        return `${baseURL}${normalizedEndpoint}`;
    }

    private async prepareRequestHeaders(
        config: RequestConfig,
    ): Promise<Record<string, string>> {
        const isFormData =
            typeof FormData !== 'undefined' && config.body instanceof FormData;

        const headers: Record<string, string> = isFormData
            ? {
                  ...DEFAULT_API_REQUEST_HEADERS,
                  ...(config.headers as Record<string, string>),
              }
            : {
                  'Content-Type': 'application/json',
                  ...DEFAULT_API_REQUEST_HEADERS,
                  ...(config.headers as Record<string, string>),
              };

        if (!config.skipAuth) {
            const token = await getToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async persistReissuedToken(response: Response): Promise<void> {
        const newToken = response.headers.get('X-New-Token');
        if (newToken?.trim()) {
            await storeToken({ token: newToken.trim() });
        }
    }

    private async handleAuthFailure(
        response: Response,
        skipAuth: boolean,
    ): Promise<void> {
        if (skipAuth) {
            return;
        }
        if (response.status !== 401 && response.status !== 403) {
            return;
        }
        const token = await getToken();
        // Do not hard-logout when there is no local token yet (e.g. boot/login races).
        if (!token) {
            throw new ApiError(
                response.status === 403
                    ? 'Your sign-in expired. Please sign in again.'
                    : 'Sign in again.',
                response.status === 403
                    ? ApiErrorType.FORBIDDEN
                    : ApiErrorType.UNAUTHORIZED,
                response.status,
            );
        }

        await clearTokens();
        const message =
            response.status === 403
                ? 'Your sign-in expired. Please sign in again.'
                : 'Sign in again.';
        emitSessionInvalid(message, response.status);
        throw new ApiError(
            message,
            response.status === 403
                ? ApiErrorType.FORBIDDEN
                : ApiErrorType.UNAUTHORIZED,
            response.status,
        );
    }

    private async processResponse<T>(
        response: Response,
        url: string,
        config: RequestConfig,
    ): Promise<T> {
        await this.persistReissuedToken(response);

        if (apiConfig.enableLogging) {
            console.log(`[API] ${config.method || 'GET'} ${url}`, {
                status: response.status,
                statusText: response.statusText,
            });
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            if (!response.ok) {
                throw new ApiError(
                    `Request failed: ${response.statusText}`,
                    getErrorTypeFromStatus(response.status),
                    response.status,
                );
            }
            return response as unknown as T;
        }

        let data: unknown;
        try {
            data = await response.json();
        } catch (error) {
            throw new ApiError(
                'Invalid JSON response',
                ApiErrorType.UNKNOWN,
                response.status,
                undefined,
                error instanceof Error ? error : undefined,
            );
        }

        if (!response.ok) {
            if (
                (response.status === 401 || response.status === 403) &&
                !config.skipAuth
            ) {
                await this.handleAuthFailure(response, false);
            }
            if (!config.skipErrorLogging && data && typeof data === 'object') {
                logError(
                    new ApiError(
                        (data as { message?: string }).message ||
                            response.statusText,
                        getErrorTypeFromStatus(response.status),
                        response.status,
                    ),
                    {
                        endpoint: url,
                        method: config.method || 'GET',
                    },
                );
            }
            if (apiConfig.enableLogging && data && typeof data === 'object') {
                const msg = (data as { message?: string }).message;
                if (msg) {
                    console.log(`[API] error: ${msg}`, {
                        status: response.status,
                    });
                }
            }
        }

        if (data && typeof data === 'object') {
            const envelope = {
                ...(data as Record<string, unknown>),
                status:
                    typeof (data as { status?: unknown }).status === 'number'
                        ? (data as { status: number }).status
                        : response.status,
                error:
                    (data as { error?: boolean }).error === true ||
                    !response.ok,
            };
            return envelope as T;
        }

        if (!response.ok) {
            throw new ApiError(
                `Request failed: ${response.statusText}`,
                getErrorTypeFromStatus(response.status),
                response.status,
            );
        }

        return data as T;
    }

    private async fetchWithTimeout(
        url: string,
        config: RequestInit,
        timeout: number,
    ): Promise<Response> {
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
    }

    private async retryRequest(
        url: string,
        config: RequestConfig,
        attempt = 0,
    ): Promise<Response> {
        const {
            timeout,
            retries,
            skipAuth,
            skipErrorLogging,
            priority: _priority,
            ...fetchConfig
        } = config;
        const maxRetries = retries ?? apiConfig.retryAttempts;

        try {
            const networkState = await getNetworkState();
            const adaptiveTimeout = getAdaptiveTimeout(
                timeout ?? apiConfig.timeout,
                networkState.quality,
            );

            const response = await this.fetchWithTimeout(
                url,
                fetchConfig,
                adaptiveTimeout,
            );

            await this.persistReissuedToken(response);
            if (!response.ok && !skipAuth) {
                await this.handleAuthFailure(response, skipAuth || false);
            }

            return response;
        } catch (error) {
            this.recordCircuitBreakerFailure(url);

            const apiError =
                error instanceof ApiError
                    ? error
                    : new ApiError(
                          error instanceof Error ? error.message : 'Network error',
                          ApiErrorType.NETWORK,
                          undefined,
                          undefined,
                          error instanceof Error ? error : undefined,
                      );

            if (attempt < maxRetries && isRetryableError(apiError)) {
                const delay = getRetryDelay(attempt);

                if (apiConfig.enableLogging) {
                    console.log(
                        `Retrying request to ${url} (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms`,
                    );
                }

                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.retryRequest(url, config, attempt + 1);
            }

            throw apiError;
        }
    }

    async request<T = unknown>(
        endpoint: string,
        config: RequestConfig = {},
    ): Promise<T> {
        const url = this.normalizeUrl(endpoint);

        if (!this.checkCircuitBreaker(url)) {
            throw new ApiError(
                'Service temporarily unavailable',
                ApiErrorType.SERVER,
                503,
            );
        }

        const headers = await this.prepareRequestHeaders(config);

        const { priority: _priority, ...fetchConfig } = config;
        const requestConfig: RequestConfig = {
            ...fetchConfig,
            headers,
        };

        if (this.shouldDeduplicate(requestConfig)) {
            const requestKey = this.createRequestKey(url, requestConfig);
            const cachedRequest = this.getCachedRequest(requestKey);

            if (cachedRequest) {
                this.logDeduplication(requestKey);
                const response = await cachedRequest;
                await this.persistReissuedToken(response);
                if (!response.ok && !requestConfig.skipAuth) {
                    await this.handleAuthFailure(
                        response,
                        requestConfig.skipAuth || false,
                    );
                }
                return this.processResponse<T>(response, url, requestConfig);
            }

            const requestPromise = this.retryRequest(url, requestConfig).finally(() => {
                this.removeCachedRequest(requestKey);
            });

            this.cacheRequest(requestKey, requestPromise);
            const response = await requestPromise;
            return this.processResponse<T>(response, url, requestConfig);
        }

        const response = await this.retryRequest(url, requestConfig);
        return this.processResponse<T>(response, url, requestConfig);
    }

    get<T = unknown>(
        endpoint: string,
        config?: Omit<RequestConfig, 'method' | 'body'>,
    ): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    post<T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: Omit<RequestConfig, 'method'>,
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
            headers:
                data instanceof FormData
                    ? config?.headers
                    : {
                          ...((config?.headers as Record<string, string>) || {}),
                          'Content-Type': 'application/json',
                      },
        });
    }

    patch<T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: Omit<RequestConfig, 'method'>,
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PATCH',
            body: data instanceof FormData ? data : JSON.stringify(data),
            headers:
                data instanceof FormData
                    ? config?.headers
                    : {
                          ...((config?.headers as Record<string, string>) || {}),
                          'Content-Type': 'application/json',
                      },
        });
    }

    put<T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: Omit<RequestConfig, 'method'>,
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
            headers:
                data instanceof FormData
                    ? config?.headers
                    : {
                          ...((config?.headers as Record<string, string>) || {}),
                          'Content-Type': 'application/json',
                      },
        });
    }

    del<T = unknown>(
        endpoint: string,
        config?: Omit<RequestConfig, 'method' | 'body'>,
    ): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }
}

export const httpClient = new TroottHttpClient();
