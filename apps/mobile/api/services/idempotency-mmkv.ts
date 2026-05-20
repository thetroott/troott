/** Subset of MMKV used for idempotent request keys. */
export interface MmkvLike {
    getString(key: string): string | undefined;
    set(key: string, value: string | boolean | number | Uint8Array): void;
    delete(key: string): void;
}

export interface IdempotencyKeyStorage {
    getKey(): Promise<string>;
    rotateKey?(): Promise<string>;
}

function newRequestKey(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `k_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function createMmkvIdempotencyStorage(
    mmkv: MmkvLike,
    storageKey: string,
): IdempotencyKeyStorage {
    async function ensureKey(): Promise<string> {
        let key = mmkv.getString(storageKey);
        if (!key) {
            key = newRequestKey();
            mmkv.set(storageKey, key);
        }
        return key;
    }

    return {
        getKey: ensureKey,
        rotateKey: async () => {
            const key = newRequestKey();
            mmkv.set(storageKey, key);
            return key;
        },
    };
}
