import { MMKV } from 'react-native-mmkv';
import { createMmkvIdempotencyStorage } from '@troott/api-client';

const storage = createMmkvIdempotencyStorage(
    new MMKV(),
    'troott:idempotency:request-key',
);

/** Backwards-compatible shape for existing imports (`getRequestKey` / `setRequestKey`). */
const IdempotentService = {
    async getRequestKey(): Promise<string> {
        return storage.getKey();
    },

    async setRequestKey(): Promise<string> {
        if (storage.rotateKey) {
            return storage.rotateKey();
        }
        return storage.getKey();
    },
};

export default IdempotentService;
