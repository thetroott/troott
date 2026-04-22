import TrackPlayer, { Event } from '@rntp/player';

import { SKIP_TO_PREVIOUS_THRESHOLD } from '@/engine/constants/engine';
import { mergeLastPlayedPosition } from '@/engine/state/last-played-sync';
import { handleActiveTrackChanged } from '@/engine/queries/current-track';
import { appendAutoplayTailToPlayerQueueIfNeeded } from '@/engine/core/autoplay-tail-append';

let listenersAttached = false;
let lastProgressPersistMs = 0;
const PROGRESS_PERSIST_INTERVAL_MS = 20_000;

/**
 * Foreground listeners for @rntp/player v5: active item sync, custom Previous threshold, errors.
 * Call once after `setupPlayer` succeeds (e.g. from `app/_layout.tsx`). Do not register `registerPlaybackService`.
 */
export function attachEnginePlaybackListeners(): void {
    if (listenersAttached) return;
    listenersAttached = true;

    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        const { position } = TrackPlayer.getProgress();
        if (position < SKIP_TO_PREVIOUS_THRESHOLD) TrackPlayer.skipToPrevious();
        else TrackPlayer.seekTo(0);
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, (e) => {
        TrackPlayer.seekTo(e.position);
    });

    TrackPlayer.addEventListener(Event.RemoteSkipForward, (e) => {
        TrackPlayer.seekBy(e.interval);
    });

    TrackPlayer.addEventListener(Event.RemoteSkipBackward, (e) => {
        TrackPlayer.seekBy(-e.interval);
    });

    TrackPlayer.addEventListener(Event.MediaItemTransition, () => {
        void (async () => {
            await handleActiveTrackChanged();
            await appendAutoplayTailToPlayerQueueIfNeeded();
        })();
    });

    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (e) => {
        const now = Date.now();
        if (now - lastProgressPersistMs < PROGRESS_PERSIST_INTERVAL_MS) return;
        lastProgressPersistMs = now;
        mergeLastPlayedPosition(e.position, e.duration);
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        const { position, duration } = TrackPlayer.getProgress();
        mergeLastPlayedPosition(position, duration);
    });

    TrackPlayer.addEventListener(Event.PlaybackError, ({ code, message }) => {
        let url: unknown;
        try {
            const active = TrackPlayer.getActiveMediaItem() as
                | { url?: unknown }
                | null
                | undefined;
            url = active?.url;
        } catch {
            /* player may be in a bad state while reporting the error */
        }
        // `console.error` surfaces as a redbox in dev; content/codec issues are not always app bugs
        console.warn(
            '[TrackPlayer] PlaybackError',
            String(code),
            String(message),
            'activeUrl:',
            url,
        );
    });
}

/** @deprecated v4 service entry; v5 uses {@link attachEnginePlaybackListeners} from the app root. */
export async function playerBackgroundService(): Promise<void> {
    // Intentionally empty — no headless JS service in v5 for basic playback.
}
