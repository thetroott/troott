import { networkStatusTypes } from '@/types/network-status';
import type {
    SermonDownload,
    SermonItemDTO,
    SermonTrackDTO,
} from '@/types/sermon';
import { QueuingType } from '@/utils/enums.util';
import _, { isEmpty, isNull, isUndefined } from 'lodash';
import TrackPlayer from '@rntp/player';

/**
 * Finds and returns the index of the player queue to insert additional tracks into
 * @param playQueue The current player queue
 * @returns The index to insert songs to play next at
 */
export async function findPlayNextIndexStart(playQueue: SermonTrackDTO[]) {
    if (isEmpty(playQueue)) return 0;

    const activeTrack =
        TrackPlayer.getActiveMediaItem() as SermonTrackDTO | null;

    const activeIndex = playQueue.findIndex(
        (track) => track.item.id === activeTrack?.item.id,
    );

    if (!activeTrack || activeIndex === -1) return 0;
    else return activeIndex + 1;
}

/**
 * Finds and returns the index of the play queue to insert user queue tracks into
 * @param playQueue The current player queue
 * @returns The index to insert songs to add to the user queue
 */
export async function findPlayQueueIndexStart(
    playQueue: SermonTrackDTO[],
    currentIndex: number,
) {
    if (isEmpty(playQueue)) return 0;

    if (currentIndex === -1) return 0;

    const insertIndex = playQueue.findIndex(
        ({ QueuingType: queuingType }, index) =>
            queuingType === QueuingType.FromSelection && index > currentIndex,
    );

    if (insertIndex === -1) return playQueue.length;
    else return insertIndex;
}

export function buildNewQueue(
    existingQueue: SermonTrackDTO[],
    tracksToInsert: SermonTrackDTO[],
    insertIndex: number,
) {
    console.debug(`Building new queue`);

    let newQueue: SermonTrackDTO[] = [];

    if (_.isEmpty(existingQueue)) newQueue = tracksToInsert;
    else {
        newQueue = _.cloneDeep(existingQueue).splice(
            insertIndex,
            0,
            ...tracksToInsert,
        );
    }

    console.debug(`Built new queue of ${newQueue.length} items`);

    return newQueue;
}

export function filterTracksOnNetworkStatus(
    networkStatus: networkStatusTypes | undefined | null,
    queuedItems: SermonItemDTO[],
    downloadedTracks: SermonDownload[],
) {
    if (
        isUndefined(networkStatus) ||
        isNull(networkStatus) ||
        networkStatus === networkStatusTypes.ONLINE
    )
        return queuedItems;
    else
        return queuedItems.filter((item) =>
            downloadedTracks
                .map((download) => download.item.id)
                .includes(item.id),
        );
}

/**
 * Fetches the manually queued tracks from the queue
 * @param queue The queue to fetch the manually queued tracks from
 * @returns The manually queued tracks
 */
export function fetchManuallyQueuedTracks(
    queue: SermonTrackDTO[],
): SermonTrackDTO[] {
    return queue.filter(
        (track) =>
            track.QueuingType === QueuingType.PlayingNext ||
            track.QueuingType === QueuingType.DirectlyQueued,
    );
}

/**
 * @name shuffleSermonTracks * Shuffles the sermon tracks
 * @description tracks The tracks to shuffle
 * Shuffles sermon tracks using the **Fisher-Yates (Knuth) shuffle**: reverse iteration
 * from the last index, pick a random `j` in `[0, i]`, swap `shuffled[i]` and `shuffled[j]`.
 * Only tracks with {@link QueuingType.FromSelection} are shuffled; manually queued
 * tracks are returned separately and unchanged.
 *
 * @param tracks Tracks to shuffle (not mutated; `original` in the result is the same reference).
 * @returns `shuffled` — Fisher-Yates permutation of selection tracks; `manuallyQueued` — play-next / directly-queued rows; `original` — input array.
 */
export function shuffleSermonTracks(tracks: SermonTrackDTO[]): {
    shuffled: SermonTrackDTO[];
    manuallyQueued: SermonTrackDTO[];
    original: SermonTrackDTO[];
} {
    // Make a copy to avoid mutating the original array, filtering out manually queued tracks
    const shuffled = [
        ...tracks.filter(
            (track) => track.QueuingType === QueuingType.FromSelection,
        ),
    ];

    const manuallyQueued = fetchManuallyQueuedTracks(tracks);

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return { shuffled, manuallyQueued, original: tracks };
}
