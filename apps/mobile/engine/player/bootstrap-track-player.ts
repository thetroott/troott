import { Platform } from 'react-native';
import Initialize from '@/engine/helpers/initialization';
import { startPlayerService } from '@/engine/player/setup';

export function isAndroidBackgroundSetupError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    const m = msg.toLowerCase();
    return (
        Platform.OS === 'android' &&
        (m.includes('android_cannot_setup_player_in_background') ||
            m.includes('cannot_setup_player_in_background') ||
            (m.includes('foreground') && m.includes('player')))
    );
}

/** Returns false when Android defers setup until foreground; true otherwise. */
export async function bootstrapTrackPlayer(): Promise<boolean> {
    try {
        await startPlayerService();
        await Initialize();
        return true;
    } catch (e) {
        if (isAndroidBackgroundSetupError(e)) {
            console.warn(
                '[TrackPlayer] Deferred until app is foreground (Android):',
                e instanceof Error ? e.message : e,
            );
            return false;
        }
        console.warn('TrackPlayer bootstrap failed:', e);
        return true;
    }
}
