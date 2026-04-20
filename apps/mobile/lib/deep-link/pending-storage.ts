import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PendingStableTarget } from './parse-stable-target';
import { parseStableTargetFromUrl } from './parse-stable-target';

const STORAGE_KEY = '@troott/pending_stable_target_v1';

export async function setPendingStableTargetFromUrl(
    url: string,
): Promise<void> {
    const target = parseStableTargetFromUrl(url);
    if (!target) {
        return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(target));
}

export async function getAndClearPendingStableTarget(): Promise<PendingStableTarget | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
    try {
        return JSON.parse(raw) as PendingStableTarget;
    } catch {
        return null;
    }
}
