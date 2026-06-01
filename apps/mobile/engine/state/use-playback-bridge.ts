import {
    usePlaybackDispatch,
    useQueueDispatch,
} from '@/context';
import TrackPlayer, { Event } from '@rntp/player';
import { useEffect, useRef } from 'react';
import { usePlayerQueueStore } from './player-queue-store';

const PROGRESS_SYNC_INTERVAL_MS = 750;

/**
 * One-way bridge: RNTP engine + player-queue zustand store (legacy sync hooks are no-ops).
 * playback and queue sync hooks. Must render under `<TroottStateProvider />` (pass-through on mobile).
 */
export function usePlaybackBridge(): void {
    const playbackDispatch = usePlaybackDispatch();
    const queueDispatch = useQueueDispatch();

    const currentTrack = usePlayerQueueStore((s) => s.currentTrack);
    const queue = usePlayerQueueStore((s) => s.queue);
    const repeatMode = usePlayerQueueStore((s) => s.repeatMode);
    const shuffled = usePlayerQueueStore((s) => s.shuffled);
    const lastPlayed = usePlayerQueueStore((s) => s.lastPlayed);

    useEffect(() => {
        const id =
            currentTrack?.id != null ? String(currentTrack.id) : null;
        playbackDispatch({
            type: 'SYNC_PLAYBACK_BRIDGE',
            payload: {
                currentTrackId: id,
                shuffle: shuffled,
                repeatMode,
            },
        });
    }, [currentTrack, playbackDispatch, repeatMode, shuffled]);

    useEffect(() => {
        const ids = queue
            .map((t) => (t.id != null ? String(t.id) : ''))
            .filter(Boolean);
        queueDispatch({
            type: 'SYNC_QUEUE_BRIDGE',
            payload: { queueIds: ids },
        });
    }, [queue, queueDispatch]);

    useEffect(() => {
        if (!lastPlayed?.sermonId) return;
        playbackDispatch({
            type: 'SET_RESUME_POINT',
            payload: {
                trackId: lastPlayed.sermonId,
                positionMs: Math.round(lastPlayed.lastPositionSec * 1000),
                durationMs: Math.round(lastPlayed.durationSec * 1000),
                updatedAt: new Date().toISOString(),
            },
        });
    }, [lastPlayed, playbackDispatch]);

    const lastProgressSyncAt = useRef(0);

    useEffect(() => {
        const sub = TrackPlayer.addEventListener(
            Event.PlaybackProgressUpdated,
            (e) => {
                const now = Date.now();
                if (now - lastProgressSyncAt.current < PROGRESS_SYNC_INTERVAL_MS) {
                    return;
                }
                lastProgressSyncAt.current = now;
                playbackDispatch({
                    type: 'SYNC_PLAYBACK_BRIDGE',
                    payload: {
                        positionMs: Math.round(e.position * 1000),
                        durationMs: Math.round(e.duration * 1000),
                    },
                });
            },
        );
        return () => {
            const s = sub as { remove?: () => void } | void;
            s?.remove?.();
        };
    }, [playbackDispatch]);
}

/** Mount once at root (e.g. root layout). */
export function PlaybackBridge(): null {
    usePlaybackBridge();
    return null;
}
