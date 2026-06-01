/**
 * Player / queue mutation payloads (client state, not raw API bodies).
 */
import type { IAPIResponse } from '@/api/types';
import type { QueuingType } from '@/api/types';

import type { networkStatusTypes } from './network.dto';
import type { Queue } from './queue-client.dto';
import type { SermonItemDTO } from './sermon.dto';

/**
 * A mutation to handle loading a new queue.
 */
export interface QueueMutationDTO {
    api: IAPIResponse | undefined;
    networkStatus: networkStatusTypes | null;
    track: SermonItemDTO;
    index?: number | undefined;
    tracklist: SermonItemDTO[];
    queue: Queue;
    queuingType?: QueuingType | undefined;
    shuffled?: boolean | undefined;
    startPlayback?: boolean | undefined;
    /** When set, used to extend thin queues (e.g. resume single item). Defaults in {@link useLoadNewQueue}. */
    autoplayCatalogTail?: SermonItemDTO[] | undefined;
    /** Prefer same minister/artist when merging autoplay tail. */
    autoplayPreferMinister?: string | null | undefined;
}

/**
 * A mutation to handle adding a track to the queue.
 */
export interface AddToQueueMutation {
    api: IAPIResponse | undefined;
    networkStatus: networkStatusTypes | null;
    tracks: SermonItemDTO[];
    queuingType?: QueuingType | undefined;
}

/**
 * A mutation to handle reordering the queue.
 */
export interface QueueOrderMutation {
    from: number;
    to: number;
}
