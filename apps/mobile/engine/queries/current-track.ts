import TrackPlayer from '@rntp/player';
import { queryClient } from '../../services/query-client';
import {
    ACTIVE_INDEX_QUERY_KEY,
    NOW_PLAYING_QUERY_KEY,
    PLAY_QUEUE_QUERY_KEY,
} from '@/engine/queries/query-keys';
import type { SermonTrackDTO } from '@/types/sermon';
import { recordLastPlayedFromTrack } from '@/engine/state/last-played-sync';
import { usePlayerQueueStore } from '@/engine/state/player-queue-store';

function trackStableId(t: SermonTrackDTO | undefined): string {
    if (!t) return '';
    return String(t.mediaId ?? t.item?.id ?? t.id ?? '');
}

/**
 * RNTP often returns slim `getActiveMediaItem()` / `getQueue()` objects on iOS.
 * Re-apply artwork and `item` fields from the last known rich queue.
 */
function mergeSermonTrackMetadata(
    prev: SermonTrackDTO | undefined,
    incoming: SermonTrackDTO | undefined,
): SermonTrackDTO | undefined {
    if (!incoming) return prev;
    if (!prev) return incoming;
    if (
        trackStableId(prev) !== trackStableId(incoming) ||
        !trackStableId(prev)
    ) {
        return incoming;
    }
    return {
        ...prev,
        ...incoming,
        url: incoming.url ?? prev.url,
        artwork: incoming.artwork ?? prev.artwork,
        artworkUrl: incoming.artworkUrl ?? prev.artworkUrl,
        item: {
            ...prev.item,
            ...incoming.item,
            image: incoming.item?.image ?? prev.item?.image,
            title: incoming.item?.title ?? prev.item?.title,
        },
    };
}

export function getActiveIndex(): number | undefined {
    return queryClient.getQueryData(ACTIVE_INDEX_QUERY_KEY) as
        | number
        | undefined;
}

export function setActiveIndex(index: number): void {
    queryClient.setQueryData(ACTIVE_INDEX_QUERY_KEY, index);
}

export function getCurrentTrack(): SermonTrackDTO | undefined {
    return queryClient.getQueryData(NOW_PLAYING_QUERY_KEY);
}

export function getPlayQueue(): SermonTrackDTO[] | undefined {
    return queryClient.getQueryData(PLAY_QUEUE_QUERY_KEY) as
        | SermonTrackDTO[]
        | undefined;
}

export function setPlayQueue(tracks: SermonTrackDTO[]): void {
    queryClient.setQueryData(PLAY_QUEUE_QUERY_KEY, tracks);
}

export async function handleActiveTrackChanged(): Promise<void> {
    const incomingQueue = TrackPlayer.getQueue() as SermonTrackDTO[];
    const activeTrack = TrackPlayer.getActiveMediaItem() as
        | SermonTrackDTO
        | undefined;
    const activeIndex = TrackPlayer.getActiveMediaItemIndex();

    const prevQueue = usePlayerQueueStore.getState().queue;

    const mergedQueue = incomingQueue.map((track) => {
        const prevMatch = prevQueue.find(
            (p) => trackStableId(p) === trackStableId(track),
        );
        return mergeSermonTrackMetadata(prevMatch, track) ?? track;
    });

    const prevCurrent =
        activeIndex != null && activeIndex >= 0
            ? prevQueue[activeIndex]
            : undefined;
    const prevById = prevQueue.find(
        (p) => trackStableId(p) === trackStableId(activeTrack),
    );
    const mergedCurrent = mergeSermonTrackMetadata(
        prevById ?? prevCurrent,
        activeTrack,
    );

    usePlayerQueueStore.getState().setQueue(mergedQueue);
    usePlayerQueueStore.getState().setCurrentTrack(mergedCurrent);
    usePlayerQueueStore.getState().setCurrentIndex(activeIndex ?? undefined);
    recordLastPlayedFromTrack(mergedCurrent);
}
