import {
    createMmkvIdempotencyStorage,
    type IdempotencyKeyStorage,
} from './idempotency-mmkv';

let storage: IdempotencyKeyStorage | null = null;

function getIdempotencyStorage(): IdempotencyKeyStorage {
    if (!storage) {
        // Lazy init: use shared `getMMKV()` (in-memory fallback when native MMKV / New Arch is unavailable).
        // Avoid static `import './mmkv-storage'` to prevent circular module init with `mmkv-storage`.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getMMKV } = require('./mmkv-storage') as typeof import('./mmkv-storage');
        storage = createMmkvIdempotencyStorage(
            getMMKV(),
            'troott:idempotency:request-key',
        );
    }
    return storage;
}

/** Backwards-compatible shape for existing imports (`getRequestKey` / `setRequestKey`). */
const IdempotentService = {
    async getRequestKey(): Promise<string> {
        return getIdempotencyStorage().getKey();
    },

    async setRequestKey(): Promise<string> {
        const s = getIdempotencyStorage();
        if (s.rotateKey) {
            return s.rotateKey();
        }
        return s.getKey();
    },
};

export default IdempotentService;
