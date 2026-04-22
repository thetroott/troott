import { isUndefined } from 'lodash';
import {
    getActiveIndex,
    getCurrentTrack,
    getPlayQueue,
} from '../queries/current-track';
import TrackPlayer, { RepeatMode } from '@rntp/player';
import { handleActiveTrackChanged } from '@/engine/queries/current-track';
import { usePlayerQueueStore } from '@/engine/state/player-queue-store';
import { resolvePlaybackUrisForTrackPlayer } from '@/engine/utils/resolve-playback-uris';
import { queryClient } from '../../services/query-client';
import { REPEAT_MODE_QUERY_KEY } from '@/engine/queries/query-keys';

export default async function Initialize() {
    const {
        queue: persistedQueue,
        currentIndex: persistedIndex,
        currentTrack: persistedTrack,
        repeatMode,
    } = usePlayerQueueStore.getState();

    const storedPlayQueue =
        persistedQueue.length > 0 ? persistedQueue : getPlayQueue();
    const storedIndex = persistedIndex ?? getActiveIndex();
    const storedTrack = persistedTrack ?? getCurrentTrack();

    const trackDebugId =
        storedTrack?.item?.id ?? storedTrack?.mediaId ?? 'none';
    console.debug(
        `StoredIndex: ${storedIndex}, storedPlayQueue: ${storedPlayQueue?.map(
            (_, index) => index,
        )}, track: ${trackDebugId}`,
    );

    if (
        Array.isArray(storedPlayQueue) &&
        storedPlayQueue.length > 0 &&
        !isUndefined(storedIndex) &&
        storedIndex !== null
    ) {
        console.debug('Initializing play queue from storage');

        const restoredQueue = await resolvePlaybackUrisForTrackPlayer(
            storedPlayQueue,
        );

        TrackPlayer.clear();
        TrackPlayer.setMediaItems(restoredQueue, storedIndex);

        usePlayerQueueStore.getState().setQueue(restoredQueue);
        usePlayerQueueStore.getState().setCurrentIndex(storedIndex);
        usePlayerQueueStore
            .getState()
            .setCurrentTrack(restoredQueue[storedIndex] ?? undefined);

        console.debug('Initialized play queue from storage');
    }

    await handleActiveTrackChanged();

    const restoredRepeatMode = repeatMode ?? RepeatMode.Off;
    TrackPlayer.setRepeatMode(restoredRepeatMode);
    queryClient.setQueryData(REPEAT_MODE_QUERY_KEY, restoredRepeatMode);
}
