import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import TrackPlayer, { Event } from '@rntp/player';

import { useLibrarySessionEnabled } from '@/api/hooks/app/useLibrary';
import { useSavePlaybackProgressMutation } from '@/api/hooks/app/usePlayback';
import { usePlayerQueueStore } from '@/engine/state/player-queue-store';

const SAVE_DEBOUNCE_MS = 30_000;

function resolveActiveSermonId(): string | null {
    const track = usePlayerQueueStore.getState().currentTrack;
    const id = track?.item?.id ?? track?.id;
    return id != null && String(id).length > 0 ? String(id) : null;
}

/**
 * Debounced POST /playback while playing; flush on pause, track end, app background.
 */
export function useSyncPlaybackProgress(): void {
    const sessionEnabled = useLibrarySessionEnabled();
    const save = useSavePlaybackProgressMutation();
    const lastSavedAtRef = useRef(0);
    const pendingRef = useRef<{
        sermonId: string;
        positionSeconds: number;
        durationSeconds?: number;
    } | null>(null);
    const saveInFlightRef = useRef(false);

    const flush = useCallback(
        async (force = false) => {
            if (!sessionEnabled || saveInFlightRef.current) {
                return;
            }
            const pending = pendingRef.current;
            if (!pending) {
                return;
            }
            const now = Date.now();
            if (!force && now - lastSavedAtRef.current < SAVE_DEBOUNCE_MS) {
                return;
            }

            saveInFlightRef.current = true;
            try {
                await save.mutateAsync({
                    sermonId: pending.sermonId,
                    positionSeconds: pending.positionSeconds,
                    ...(pending.durationSeconds != null
                        ? { durationSeconds: pending.durationSeconds }
                        : {}),
                });
                lastSavedAtRef.current = Date.now();
            } catch {
                /* offline / 401 — local resume still works */
            } finally {
                saveInFlightRef.current = false;
            }
        },
        [save, sessionEnabled],
    );

    const queueProgress = useCallback(
        (positionSec: number, durationSec: number) => {
            const sermonId = resolveActiveSermonId();
            if (!sermonId || !sessionEnabled) {
                return;
            }
            pendingRef.current = {
                sermonId,
                positionSeconds: Math.max(0, Math.floor(positionSec)),
                durationSeconds:
                    durationSec > 0 ? Math.floor(durationSec) : undefined,
            };
            void flush(false);
        },
        [flush, sessionEnabled],
    );

    useEffect(() => {
        const progressSub = TrackPlayer.addEventListener(
            Event.PlaybackProgressUpdated,
            (event) => {
                queueProgress(event.position, event.duration);
            },
        );

        const pauseSub = TrackPlayer.addEventListener(Event.RemotePause, () => {
            void flush(true);
        });

        const appSub = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'background' || nextState === 'inactive') {
                void flush(true);
            }
        });

        return () => {
            progressSub.remove();
            pauseSub.remove();
            appSub.remove();
        };
    }, [flush, queueProgress]);
}

export function PlaybackProgressSync(): null {
    useSyncPlaybackProgress();
    return null;
}
