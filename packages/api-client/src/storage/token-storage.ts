/** Persists access tokens for authenticated API calls. */
export interface TokenStorage {
    getAccessToken(): string | null | Promise<string | null>;
    setAccessToken(token: string | null): void | Promise<void>;
}

/** Optional idempotency key provider for mutating requests. */
export interface IdempotencyKeyStorage {
    getKey(): string | Promise<string>;
    rotateKey?(): string | Promise<string>;
}

export function createMemoryTokenStorage(
    initial: string | null = null,
): TokenStorage {
    let token = initial;
    return {
        getAccessToken: () => token,
        setAccessToken: (t: string | null) => {
            token = t;
        },
    };
}

/** Browser localStorage (`accessToken` key — align with apps/web storage util). */
export function createWebLocalStorageAdapter(key = 'accessToken'): TokenStorage {
    return {
        getAccessToken: () => {
            if (typeof window === 'undefined' || !window.localStorage)
                return null;
            return window.localStorage.getItem(key);
        },
        setAccessToken: (token: string | null) => {
            if (typeof window === 'undefined' || !window.localStorage) return;
            if (token === null) window.localStorage.removeItem(key);
            else window.localStorage.setItem(key, token);
        },
    };
}
