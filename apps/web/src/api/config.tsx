import Troott, { troottAPIClient } from '@/api/clients/troott';

function apiV1BaseUrl(): string {
    const raw = import.meta.env.VITE_APP_API_URL?.trim() ?? '';
    const origin = raw.replace(/\/?$/, '');
    if (!origin) {
        if (import.meta.env.DEV) {
            console.warn(
                '[api/config] VITE_APP_API_URL is not set; defaulting to same-origin `/api/v1`.',
            );
        }
        return '/api/v1';
    }
    return `${origin}/api/v1`;
}

/** Configured Troott HTTP client (singleton). Prefer this in feature code. */
const api = new Troott(apiV1BaseUrl());

export default api;

export { api, troottAPIClient };
