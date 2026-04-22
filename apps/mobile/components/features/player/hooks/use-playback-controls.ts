import { useCallback, useMemo } from 'react';
import { RepeatMode } from '@rntp/player';

import { MINIPLAYER_UPDATE_INTERVAL } from '@/engine/constants/engine';
import { UiPlaybackState } from '@/engine/constants/playback-ui';
import {
    usePrevious,
    useSeekTo,
    useSkip,
    useTogglePlayback,
    useToggleRepeatMode,
    useToggleShuffle,
} from '@/engine/hooks/useControl';
import {
    usePlaybackState,
    useProgress,
} from '@/engine/queries/playback-queries';
import { useCanSkipNext } from '@/hooks/player/use-can-skip-next';
import { useResumeLastPlayed } from '@/hooks/player/use-resume-last-played';
import {
    useCurrentTrack,
    useLastPlayed,
    usePlayQueue,
    useRepeatModeStoreValue,
    useShuffle,
} from '@/stores/player/queue';
import { capturePlayerEvent } from '@/components/features/player/analytics/player.analytics';

type UsePlaybackControlsArgs = {
    source?: string;
    analyticsEnabled?: boolean;
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mins}:${secs}`;
};

export function usePlaybackControls({
    source = 'full_player',
    analyticsEnabled = true,
}: UsePlaybackControlsArgs = {}) {
    const shuffle = useShuffle();
    const repeatModeRn = useRepeatModeStoreValue();
    const progress = useProgress(MINIPLAYER_UPDATE_INTERVAL);
    const playbackState = usePlaybackState();
    const togglePlayback = useTogglePlayback();
    const seekTo = useSeekTo();
    const skip = useSkip();
    const previous = usePrevious();
    const canSkipNext = useCanSkipNext();
    const toggleRepeatMode = useToggleRepeatMode();
    const toggleShuffleMut = useToggleShuffle();
    const queue = usePlayQueue();
    const lastPlayed = useLastPlayed();
    const currentTrack = useCurrentTrack();
    const resumeLastPlayed = useResumeLastPlayed();

    const trackPlaying = playbackState === UiPlaybackState.Playing;

    const trackId = currentTrack?.item?.id != null ? String(currentTrack.item.id) : null;

    const positionUi =
        progress.duration > 0.5
            ? progress.position
            : lastPlayed?.lastPositionSec ?? 0;
    const durationUi =
        progress.duration > 0.5
            ? progress.duration
            : Math.max(lastPlayed?.durationSec ?? 0, 1);

    const formattedPosition = useMemo(
        () => formatTime(positionUi),
        [positionUi],
    );
    const formattedDuration = useMemo(
        () => formatTime(durationUi),
        [durationUi],
    );

    const onToggleRepeat = useCallback(() => {
        void toggleRepeatMode();
        capturePlayerEvent('player_repeat_toggled', {
            track_id: trackId,
            source,
            enabled: analyticsEnabled,
        });
    }, [toggleRepeatMode, trackId, source, analyticsEnabled]);

    const onToggleShuffle = useCallback(() => {
        void toggleShuffleMut.mutateAsync(shuffle);
        capturePlayerEvent('player_shuffle_toggled', {
            track_id: trackId,
            source,
            enabled: analyticsEnabled,
        });
    }, [shuffle, toggleShuffleMut, trackId, source, analyticsEnabled]);

    const onSeekComplete = useCallback(
        (val: number) => {
            void seekTo(val);
            capturePlayerEvent('player_seek', {
                track_id: trackId,
                source,
                position: Math.floor(val),
                enabled: analyticsEnabled,
            });
        },
        [seekTo, trackId, source, analyticsEnabled],
    );

    const onPrevious = useCallback(() => {
        void previous();
        capturePlayerEvent('player_previous', {
            track_id: trackId,
            source,
            enabled: analyticsEnabled,
        });
    }, [previous, trackId, source, analyticsEnabled]);

    const onNext = useCallback(() => {
        if (!canSkipNext) return;
        void skip(undefined);
        capturePlayerEvent('player_next', {
            track_id: trackId,
            source,
            enabled: analyticsEnabled,
        });
    }, [canSkipNext, skip, trackId, source, analyticsEnabled]);

    const onTogglePlay = useCallback(() => {
        if (queue.length === 0 && lastPlayed?.streamUrl) {
            void resumeLastPlayed();
            capturePlayerEvent('player_play_clicked', {
                track_id: lastPlayed.sermonId,
                source,
                enabled: analyticsEnabled,
            });
            return;
        }

        void togglePlayback();
        capturePlayerEvent(trackPlaying ? 'player_pause_clicked' : 'player_play_clicked', {
            track_id: trackId,
            source,
            enabled: analyticsEnabled,
        });
    }, [
        queue.length,
        lastPlayed,
        resumeLastPlayed,
        togglePlayback,
        trackPlaying,
        trackId,
        source,
        analyticsEnabled,
    ]);

    return {
        shuffle,
        repeatActive: repeatModeRn !== RepeatMode.Off,
        trackPlaying,
        canSkipNext,
        durationUi,
        positionUi,
        formattedPosition,
        formattedDuration,
        onToggleRepeat,
        onToggleShuffle,
        onSeekComplete,
        onPrevious,
        onNext,
        onTogglePlay,
    };
}
