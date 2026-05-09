import Cookies from 'universal-cookie';
import type { TokenStorage } from './token-storage';
import { createMemoryTokenStorage } from './token-storage';

/**
 * Cookie-backed token storage for SSR-friendly web (same-site cookies).
 */
export function createCookieTokenStorage(cookieKey = 'accessToken'): TokenStorage {
    const cookies = new Cookies();
    return {
        getAccessToken: () => cookies.get(cookieKey) ?? null,
        setAccessToken: (token: string | null) => {
            if (token === null) cookies.remove(cookieKey, { path: '/' });
            else
                cookies.set(cookieKey, token, {
                    path: '/',
                    sameSite: 'lax',
                });
        },
    };
}

/**
 * react-native-mmkv sync adapter — pass your MMKV instance from the app.
 * Namespace keys yourself (see ARCHITECTURE.md); `key` is the full MMKV key.
 */
export function createMmkvTokenStorage(mmkv: {
    getString(key: string): string | undefined | null;
    set(key: string, value: string): void;
    delete(key: string): void;
}, key: string): TokenStorage {
    return {
        getAccessToken: () => {
            const v = mmkv.getString(key);
            return v === undefined || v === null || v === '' ? null : v;
        },
        setAccessToken: (token: string | null) => {
            if (token === null) mmkv.delete(key);
            else mmkv.set(key, token);
        },
    };
}

/** Desktop placeholder: wire Tauri/Electron secure store in the shell app. */
export function createElectronFileTokenPlaceholder(): TokenStorage {
    return createMemoryTokenStorage(null);
}
