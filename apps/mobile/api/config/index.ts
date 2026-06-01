/**
 * API Configuration
 *
 * Environment-based configuration for API endpoints, timeouts, and feature flags.
 * Supports dev, staging, and production environments.
 */

import {
    getEnvironment,
    getQueryCachePolicy,
    type Environment,
} from './cache-policy';

export type { Environment };
export { getEnvironment, getQueryCachePolicy };

const baseURL =
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    process.env.EXPO_PUBLIC_TROOTT_API_URL?.trim() ||
    '';

/**
 * API Configuration interface
 */
export interface ApiConfig {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
    enableLogging: boolean;
    enableDevTools: boolean;
    cacheTime: number;
    staleTime: number;
}

type ApiConfigBase = Omit<ApiConfig, 'cacheTime' | 'staleTime'>;

const configBases: Record<Environment, ApiConfigBase> = {
    development: {
        baseURL,
        timeout: 30000,
        retryAttempts: 2,
        enableLogging: true,
        enableDevTools: true,
    },
    staging: {
        baseURL,
        timeout: 20000,
        retryAttempts: 3,
        enableLogging: true,
        enableDevTools: false,
    },
    production: {
        baseURL,
        timeout: 15000,
        retryAttempts: 3,
        enableLogging: false,
        enableDevTools: false,
    },
};

/**
 * Get current API configuration based on environment
 */
export const getApiConfig = (): ApiConfig => {
    const env = getEnvironment();
    return {
        ...configBases[env],
        ...getQueryCachePolicy(env),
    };
};

/**
 * Current API configuration (singleton)
 */
export const apiConfig = getApiConfig();

if (__DEV__ && apiConfig.enableLogging) {
    console.log(`[API] baseURL ${apiConfig.baseURL}`);
}

/**
 * Feature flags
 */
export const features = {
    offlineMode: true,
    requestDeduplication: true,
    automaticRetry: true,
    tokenRefresh: true,
    cachePersistence: true,
    backgroundSync: true,
    circuitBreaker: true,
} as const;

/**
 * API version
 */
export const API_VERSION = 'v1';

/**
 * API endpoints base path
 */
export const API_BASE_PATH = `/api/${API_VERSION}`;

// Export endpoints
export * from './default-headers';
export * from './path';
