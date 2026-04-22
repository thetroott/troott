import type {
    AddToQueueMutation,
    QueueMutationDTO,
} from '@/types/player-mutations';
import { networkStatusTypes } from '@/types/network-status';
import type { ISermonTrack, SermonTrackDTO } from '@/types/sermon';
import { mergeAutoplayTail } from '@/engine/core/autoplay-tail';
import { usePlayerQueueStore } from '@/engine/state/player-queue-store';
import { getAudioCache } from '@/engine/utils/offline';
import {
    filterTracksOnNetworkStatus,
    shuffleSermonTracks,
} from '../helpers/helpers';
import { mapDtoToTrack } from '@/engine/utils/mappers';
import { resolvePlaybackUrisForTrackPlayer } from '@/engine/utils/resolve-playback-uris';
import { QueuingType } from '@/utils/enums.util';
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

    const finalStartIndex = availableAudioItems.findIndex(
        (item) => item.id === startingTrack.id,
    );

    const filteredOut = Math.max(
        0,
        tracklist.length - availableAudioItems.length,
    );
    console.debug(
        `loadQueue: ${availableAudioItems.length}/${tracklist.length} tracks after network filter (${networkStatus}); filtered ${filteredOut}`,
    );

    console.debug(`Final start index is ${finalStartIndex}`);

    TrackPlayer.stop();
    TrackPlayer.setMediaItems(
        queue,
        finalStartIndex >= 0 ? finalStartIndex : 0,
    );

    console.debug(
        `Queued ${queue.length} tracks, starting at ${finalStartIndex}${
            shuffled ? ' (shuffled)' : ''
        }`,
    );

    return {
        finalStartIndex: finalStartIndex >= 0 ? finalStartIndex : 0,
        tracks: queue,
    };
}

export const playNextInQueue = async ({ api, tracks }: AddToQueueMutation) => {
    const mapped = tracks.map((item) =>
        mapDtoToTrack('', item, QueuingType.PlayingNext),
    );
    const tracksToPlayNext = await resolvePlaybackUrisForTrackPlayer(mapped);

    const currentIndex = TrackPlayer.getActiveMediaItemIndex();
    const currentQueue = TrackPlayer.getQueue() as SermonTrackDTO[];

    console.debug(
        `Adding ${tracks.length} to the queue at index ${currentIndex}`,
    );

    if (currentIndex === null || isUndefined(currentIndex)) {
        TrackPlayer.addMediaItems(tracksToPlayNext);
    } else if (currentIndex === currentQueue.length - 1) {
        TrackPlayer.addMediaItems(tracksToPlayNext);
    } else {
        TrackPlayer.insertMediaItems(currentIndex + 1, tracksToPlayNext);
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
                ...tracksToPlayNext,
                ...uq.slice(anchor + 1),
            ]);
    }
};

export const playLaterInQueue = async ({ api, tracks }: AddToQueueMutation) => {
    console.debug(`Adding ${tracks.length} to queue`);

    const mapped = tracks.map((item) =>
        mapDtoToTrack('', item, QueuingType.DirectlyQueued),
    );
    const newTracks = await resolvePlaybackUrisForTrackPlayer(mapped);

    TrackPlayer.addMediaItems(newTracks);

    const updatedQueue = TrackPlayer.getQueue() as SermonTrackDTO[];
    usePlayerQueueStore.getState().setQueue(updatedQueue);

    usePlayerQueueStore
        .getState()
        .setUnshuffledQueue([
            ...usePlayerQueueStore.getState().unShuffledQueue,
            ...newTracks,
        ]);
};
