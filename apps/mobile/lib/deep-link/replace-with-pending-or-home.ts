import { router } from 'expo-router';
import { getAndClearPendingStableTarget } from './pending-storage';

/**
 * After sign-in or onboarding, open the shared sermon/playlist/minister if one was pending.
 */
export async function replaceWithPendingTargetOrHome(): Promise<void> {
    const pending = await getAndClearPendingStableTarget();
    if (pending?.kind === 'sermon') {
        router.replace(`/sermon/${pending.id}`);
        return;
    }
    if (pending?.kind === 'playlist') {
        router.replace(`/playlist/${pending.id}`);
        return;
    }
    if (pending?.kind === 'minister') {
        router.replace(`/minister/${pending.id}`);
        return;
    }
    router.replace('/(tabs)/home');
}
