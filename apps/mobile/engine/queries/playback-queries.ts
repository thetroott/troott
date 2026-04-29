import {
    useProgress as useProgressRNTP,
    usePlaybackState as useRNTPPlaybackState,
    useIsPlaying,
} from '@rntp/player';
import { PlaybackState } from '@rntp/player';
import usePlayerEngineStore, {
    PlayerEngine,
} from '@/engine/state/player-engine-store';
import {
    type MediaStatus,
    MediaPlayerState,
    useCastSession,
    useStreamPosition,
} from 'react-native-google-cast';
import { useEffect, useState } from 'react';
import type { Progress } from '@rntp/player';

import { UiPlaybackState } from '@/engine/constants/playback-ui';

export const useProgress = (UPDATE_INTERVAL: number): Progress => {
    const { position, duration, buffered, cached } =
        useProgressRNTP(UPDATE_INTERVAL);

    const playerEngineData = usePlayerEngineStore(
        (state) => state.playerEngineData,
    );

    const isCasting = playerEngineData === PlayerEngine.GOOGLE_CAST;
    const streamPosition = useStreamPosition();
    if (isCasting) {
        return {
            position: streamPosition || 0,
            duration,
            buffered: 0,
            cached: 0,
        };
    }

    return {
        position,
        duration,
        buffered,
        cached,
    };
};

const castToUiState = (state: MediaPlayerState): UiPlaybackState => {
    switch (state) {
        case MediaPlayerState.PLAYING:
            return UiPlaybackState.Playing;
        case MediaPlayerState.PAUSED:
            return UiPlaybackState.Paused;
        case MediaPlayerState.BUFFERING:
            return UiPlaybackState.Buffering;
        case MediaPlayerState.IDLE:
            return UiPlaybackState.Ready;
        case MediaPlayerState.LOADING:
            return UiPlaybackState.Loading;
        default:
            return UiPlaybackState.None;
    }
};

function mapLocalToUi(
    playbackState: PlaybackState,
    playing: boolean,
): UiPlaybackState {
    if (playing) {
        return UiPlaybackState.Playing;
    }
    if (playbackState === PlaybackState.Buffering) {
        return UiPlaybackState.Buffering;
    }
    if (playbackState === PlaybackState.Error) {
        return UiPlaybackState.Error;
    }
    if (playbackState === PlaybackState.Ended) {
        return UiPlaybackState.Ended;
    }
    return UiPlaybackState.Paused;
}

export const usePlaybackState = (): UiPlaybackState | undefined => {
    const playbackState = useRNTPPlaybackState();
    const playing = useIsPlaying();
    const playerEngineData = usePlayerEngineStore(
        (state) => state.playerEngineData,
    );
    /** Session identity is stable across renders; `useRemoteMediaClient()` can churn referentially. */
    const castSession = useCastSession();
    const client = castSession?.client ?? null;

    const isCasting = playerEngineData === PlayerEngine.GOOGLE_CAST;
    const [castUi, setCastUi] = useState<UiPlaybackState | undefined>(
        undefined,
    );

    useEffect(() => {
        if (!isCasting || !client) {
            setCastUi(undefined);
            return undefined;
        }

        const handler = (status: MediaStatus | null) => {
            if (status?.playerState) {
                setCastUi(castToUiState(status.playerState));
            }
        };

        const subscription = client.onMediaStatusUpdated(handler);

        return () => {
            subscription.remove();
        };
    }, [isCasting, castSession]);

    if (isCasting && castUi !== undefined) {
        return castUi;
    }

    return mapLocalToUi(playbackState, playing);
};
