import {
    Troott,
    createWebLocalStorageAdapter,
    normalizeApiBaseUrl,
    troottAPIClient,
} from '@troott/api-client';

function resolveRawApiBaseUrl(): string {
    const fromPrimary = (
        import.meta.env.VITE_APP_API_URL as string | undefined
    )?.trim();
    return fromPrimary || '';
}

const rawApiUrl = resolveRawApiBaseUrl();
const DEV_API_PLACEHOLDER_ORIGIN = 'http://localhost:3000';
const effectiveRawApiUrl =
    rawApiUrl || (import.meta.env.DEV ? DEV_API_PLACEHOLDER_ORIGIN : '');

if (!effectiveRawApiUrl) {
    throw new Error(
        'API base url not defined: set VITE_APP_API_URL',
    );
}

const BaseURL = normalizeApiBaseUrl(effectiveRawApiUrl);

/** Canonical `/api/v1` base URL for web API calls. */
export const WEB_API_BASE_URL = BaseURL;

void new Troott(BaseURL, {
    channel: 'web',
    locale:
        typeof navigator !== 'undefined'
            ? navigator.language?.slice(0, 2) || 'en'
            : 'en',
    tokenStorage: createWebLocalStorageAdapter('accessToken'),
    onUnauthorized: () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
    },
});

export { troottAPIClient };
