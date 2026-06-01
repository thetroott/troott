import type {
    AddToQueueMutation,
    QueueMutationDTO,
} from '@/api/dtos/player-mutations.dto';
import { networkStatusTypes } from '@/api/dtos/network.dto';
import type { ISermonTrack, SermonTrackDTO } from '@/api/dtos/sermon.dto';
import { mergeAutoplayTail } from '@/engine/core/autoplay-tail';
import { usePlayerQueueStore } from '@/engine/state/player-queue-store';
import { getAudioCache } from '@/engine/utils/offline';
import {
    filterTracksOnNetworkStatus,
    shuffleSermonTracks,
} from '../helpers/helpers';
import { mapDtoToTrack } from '@/engine/utils/mappers';
import { resolvePlaybackUrisForTrackPlayer } from '@/engine/utils/resolve-playback-uris';
import { isPlayableTrackForPlayer } from '@/engine/utils/playable-track';
import { QueuingType } from '@/api/types';
import TrackPlayer from '@rntp/player';
import { isUndefined } from 'lodash';
import { getCurrentTrack } from '../queries/current-track';

type LoadQueueResult = {
    finalStartIndex: number;
    tracks: SermonTrackDTO[];
};

export async function loadQueue({
    index,
    tracklist,
    queue: queueRef,
    shuffled = false,
    api,
    networkStatus = networkStatusTypes.ONLINE,
    autoplayCatalogTail,
    autoplayPreferMinister,
}: QueueMutationDTO): Promise<LoadQueueResult> {
    usePlayerQueueStore.getState().setQueueRef(queueRef);
    usePlayerQueueStore.getState().setShuffled(shuffled);

    const startIndex = index ?? 0;

    const startingTrack = tracklist[startIndex];

    const downloadedTracks = getAudioCache();

    let availableAudioItems = filterTracksOnNetworkStatus(
        networkStatus as networkStatusTypes,
        tracklist,
        downloadedTracks ?? [],
    );

    if (autoplayCatalogTail?.length && availableAudioItems.length < 2) {
        const prefer =
            autoplayPreferMinister ??
            startingTrack?.minister ??
            (startingTrack as ISermonTrack | undefined)?.artist ??
            null;
        const merged = mergeAutoplayTail(
            availableAudioItems,
            autoplayCatalogTail,
            {
                preferMinister: prefer,
                minItems: 2,
            },
        );
        availableAudioItems = filterTracksOnNetworkStatus(
            networkStatus as networkStatusTypes,
            merged,
            downloadedTracks ?? [],
        );
    }

    let queue = availableAudioItems.map((item) =>
        mapDtoToTrack('', item, QueuingType.FromSelection),
    );

    const resolvedUnshuffled = await resolvePlaybackUrisForTrackPlayer(queue);
    usePlayerQueueStore.getState().setUnshuffledQueue(resolvedUnshuffled);

    if (shuffled && resolvedUnshuffled.length > 1) {
        console.debug('Shuffling queue...');
        const { shuffled: shuffledTracks } = shuffleSermonTracks([
            ...resolvedUnshuffled,
        ]);
        queue = shuffledTracks;
        console.debug('Shuffled entire queue as fallback');
    } else {
        queue = resolvedUnshuffled;
    }

    const playable = queue.filter(isPlayableTrackForPlayer);
    if (playable.length === 0) {
        console.warn(
            'loadQueue: no playable tracks after resolution (all URLs empty or unresolved bundles); skip setMediaItems',
        );
        TrackPlayer.stop();
        return {
            finalStartIndex: 0,
            tracks: [],
        };
    }

    const startId = startingTrack?.id;
    const finalStartIndex = startId
        ? playable.findIndex(
              (t) => String(t.item?.id ?? t.mediaId) === String(startId),
          )
        : -1;

    const safeStartIndex = finalStartIndex >= 0 ? finalStartIndex : 0;

    const filteredOut = Math.max(
        0,
        tracklist.length - availableAudioItems.length,
    );
    console.debug(
        `loadQueue: ${availableAudioItems.length}/${tracklist.length} tracks after network filter (${networkStatus}); filtered ${filteredOut}; playable: ${playable.length}/${queue.length}`,
    );

    console.debug(
        `Final start index is ${safeStartIndex} (resolved in playable queue)`,
    );

    TrackPlayer.stop();
    TrackPlayer.setMediaItems(playable, safeStartIndex);

    console.debug(
        `Queued ${playable.length} tracks, starting at ${safeStartIndex}${
            shuffled ? ' (shuffled)' : ''
        }`,
    );

    return {
        finalStartIndex: safeStartIndex,
        tracks: playable,
    };
}

export const playNextInQueue = async ({ api, tracks }: AddToQueueMutation) => {
    const mapped = tracks.map((item) =>
        mapDtoToTrack('', item, QueuingType.PlayingNext),
    );
    const tracksToPlayNext = await resolvePlaybackUrisForTrackPlayer(mapped);
    const playableNext = tracksToPlayNext.filter(isPlayableTrackForPlayer);
    if (playableNext.length === 0) {
        console.warn(
            'playNextInQueue: no playable tracks after URI resolution; skipping',
        );
        return;
    }

    const currentIndex = TrackPlayer.getActiveMediaItemIndex();
    const currentQueue = TrackPlayer.getQueue() as SermonTrackDTO[];

    console.debug(
        `Adding ${playableNext.length} to the queue at index ${currentIndex}`,
    );

    if (currentIndex === null || isUndefined(currentIndex)) {
        TrackPlayer.addMediaItems(playableNext);
    } else if (currentIndex === currentQueue.length - 1) {
        TrackPlayer.addMediaItems(playableNext);
    } else {
        TrackPlayer.insertMediaItems(currentIndex + 1, playableNext);
    }

    const updatedQueue = TrackPlayer.getQueue() as SermonTrackDTO[];
    usePlayerQueueStore.getState().setQueue([...updatedQueue]);

    const current = getCurrentTrack();
    const uq = usePlayerQueueStore.getState().unShuffledQueue;
    const anchor = current ? uq.indexOf(current) : -1;
    if (anchor >= 0) {
        usePlayerQueueStore
            .getState()
            .setUnshuffledQueue([
                ...uq.slice(0, anchor + 1),
                ...playableNext,
                ...uq.slice(anchor + 1),
            ]);
    }
};

export const playLaterInQueue = async ({ api, tracks }: AddToQueueMutation) => {
    const mapped = tracks.map((item) =>
        mapDtoToTrack('', item, QueuingType.DirectlyQueued),
    );
    const newTracks = await resolvePlaybackUrisForTrackPlayer(mapped);
    const playable = newTracks.filter(isPlayableTrackForPlayer);
    if (playable.length === 0) {
        console.warn(
            'playLaterInQueue: no playable tracks after URI resolution; skipping',
        );
        return;
    }
    console.debug(`Adding ${playable.length} to queue`);

    TrackPlayer.addMediaItems(playable);

    const updatedQueue = TrackPlayer.getQueue() as SermonTrackDTO[];
    usePlayerQueueStore.getState().setQueue(updatedQueue);

    usePlayerQueueStore
        .getState()
        .setUnshuffledQueue([
            ...usePlayerQueueStore.getState().unShuffledQueue,
            ...playable,
        ]);
};
