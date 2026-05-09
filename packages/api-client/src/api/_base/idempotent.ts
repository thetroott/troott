import { v4 as randomUUID } from 'uuid';
import type { IdempotencyKeyStorage } from '../../storage/token-storage';

/**
 * Stable idempotency key for mutating API calls. Pass MMKV/memory-backed storage from the app.
 */
export function createIdempotencyService(
    storage: IdempotencyKeyStorage,
): IdempotencyKeyStorage {
    return storage;
}

/** In-memory idempotency (tests / SSR). */
export function createMemoryIdempotencyStore(
    initial?: string,
): IdempotencyKeyStorage {
    let key = initial ?? '';
    return {
        async getKey() {
            if (key) return key;
            key = randomUUID();
            return key;
        },
        async rotateKey() {
            key = randomUUID();
            return key;
        },
    };
}

/** Persist idempotency key on mobile MMKV (sync API). */
export function createMmkvIdempotencyStorage(
    mmkv: {
        getString(key: string): string | undefined | null;
        set(key: string, value: string): void;
        delete(key: string): void;
    },
    key: string,
): IdempotencyKeyStorage {
    return {
        async getKey() {
            const existing = mmkv.getString(key);
            if (existing && existing.length > 0) return existing;
            const id = randomUUID();
            mmkv.set(key, id);
            return id;
        },
        async rotateKey() {
            const id = randomUUID();
            mmkv.set(key, id);
            return id;
        },
    };
}
