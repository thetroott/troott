/**
 * Query cache TTLs — isolated from config/index barrel to avoid import cycles
 * when initializing the QueryClient at module load.
 */
import Constants from 'expo-constants';

export type Environment = 'development' | 'staging' | 'production';

export const getEnvironment = (): Environment => {
    const env = Constants.expoConfig?.extra?.env || process.env.NODE_ENV;

    if (env === 'production' || env === 'prod') return 'production';
    if (env === 'staging' || env === 'stage') return 'staging';
    return 'development';
};

export interface QueryCachePolicy {
    cacheTime: number;
    staleTime: number;
}

export const queryCachePolicies: Record<Environment, QueryCachePolicy> = {
    development: {
        cacheTime: 5 * 60 * 1000,
        staleTime: 0,
    },
    staging: {
        cacheTime: 10 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    },
    production: {
        cacheTime: 30 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
    },
};

export const getQueryCachePolicy = (
    env: Environment = getEnvironment(),
): QueryCachePolicy => queryCachePolicies[env] ?? queryCachePolicies.development;
