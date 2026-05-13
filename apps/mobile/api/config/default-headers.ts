/**
 * Default headers for every Troott API request.
 * Per-request `RequestConfig.headers` overrides these keys when set.
 */
export const DEFAULT_API_REQUEST_HEADERS = {
    lg: 'en',
    ch: 'web',
} as const;
