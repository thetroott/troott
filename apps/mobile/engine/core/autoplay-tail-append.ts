import TrackPlayer, { RepeatMode } from '@rntp/player';
import type { SermonItemDTO, SermonTrackDTO } from '@/types/sermon';
import { networkStatusTypes } from '@/types/network-status';

import { playLaterInQueue } from '@/engine/core/queue';
import {
    getAutoplayCatalogAsSermonItems,
    mergeAutoplayTail,
} from '@/engine/core/autoplay-tail';

const MAX_TAIL_APPEND = 50;

/**
 * When repeat is off and the user is on the last queue item, append catalog items so "next" exists.
 */
export async function appendAutoplayTailToPlayerQueueIfNeeded(): Promise<void> {
    const repeat = TrackPlayer.getRepeatMode();
    if (repeat === RepeatMode.All || repeat === RepeatMode.One) return;

    const queue = TrackPlayer.getQueue() as SermonTrackDTO[];
    const idx = TrackPlayer.getActiveMediaItemIndex();
    if (idx === null || idx === undefined || queue.length === 0) return;
    if (idx < queue.length - 1) return;

    const active = queue[idx];
    const item = active?.item as SermonItemDTO | undefined;
    const prefer = active?.artist ?? item?.minister ?? null;

    const excludeIds = new Set<string>();
    for (const t of queue) {
        const id = t.item?.id ?? t.mediaId;
        if (id != null) excludeIds.add(String(id));
    }

    const catalog = getAutoplayCatalogAsSermonItems();
    const withMinister = mergeAutoplayTail([], catalog, {
        preferMinister: prefer,
        minItems: MAX_TAIL_APPEND,
    });
    const tail = withMinister
        .filter((t) => t.id && !excludeIds.has(String(t.id)))
        .slice(0, MAX_TAIL_APPEND);

    if (tail.length === 0) return;

    await playLaterInQueue({
        api: undefined,
        networkStatus: networkStatusTypes.ONLINE,
        tracks: tail,
    });
}
