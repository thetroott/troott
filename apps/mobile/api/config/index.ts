/**
 * API Configuration
 * 
 * Environment-based configuration for API endpoints, timeouts, and feature flags.
 * Supports dev, staging, and production environments.
 */

import Constants from 'expo-constants';

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Get current environment from Expo constants
 */
export const getEnvironment = (): Environment => {
  const env = Constants.expoConfig?.extra?.env || process.env.NODE_ENV || 'development';
  
  if (env === 'production' || env === 'prod') return 'production';
  if (env === 'staging' || env === 'stage') return 'staging';
  return 'development';
};

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

/**
 * Environment-specific configurations
 */
const configs: Record<Environment, ApiConfig> = {
  development: {
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://staging.trifold.life',
    timeout: 30000, // 30 seconds for dev (more lenient)
    retryAttempts: 2,
    enableLogging: true,
    enableDevTools: true,
    cacheTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 0, // Always consider data stale in dev
  },
  staging: {
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://staging.trifold.life',
    timeout: 20000, // 20 seconds
    retryAttempts: 3,
    enableLogging: true,
    enableDevTools: false,
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  },
  production: {
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://staging.trifold.life',
    timeout: 15000, // 15 seconds (stricter for production)
    retryAttempts: 3,
    enableLogging: false, // Disable verbose logging in production
    enableDevTools: false,
    cacheTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
};

/**
 * Get current API configuration based on environment
 */
export const getApiConfig = (): ApiConfig => {
  const env = getEnvironment();
  return configs[env];
};

/**
 * Current API configuration (singleton)
 */
export const apiConfig = getApiConfig();

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
export * from './endpoints';
