import type { PendingStableTarget } from './parse-stable-target';
import { parseStableTargetFromUrl } from './parse-stable-target';
import { mmkvStateStorage } from '@/api/storage/mmkv-client';

const STORAGE_KEY = '@troott/pending_stable_target_v1';

export async function setPendingStableTargetFromUrl(
    url: string,
): Promise<void> {
    const target = parseStableTargetFromUrl(url);
    if (!target) {
        return;
    }
    mmkvStateStorage.setItem(STORAGE_KEY, JSON.stringify(target));
}

export async function getAndClearPendingStableTarget(): Promise<PendingStableTarget | null> {
    const rawMaybe = mmkvStateStorage.getItem(STORAGE_KEY);
    const raw = await Promise.resolve(rawMaybe);
    if (!raw) {
        return null;
    }
    mmkvStateStorage.removeItem(STORAGE_KEY);
    try {
        return JSON.parse(raw) as PendingStableTarget;
    } catch {
        return null;
    }
}
