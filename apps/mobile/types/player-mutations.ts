import { networkStatusTypes } from "@/types/network-status"
import type { Queue } from "@/types/queue-ref"
import type { SermonItemDTO } from "@/types/sermon"
import type { IAPIResponse } from "@/utils/interface.utl"
import type { QueuingType } from "@/utils/enums.util"

/**
 * A mutation to handle loading a new queue.
 */
export interface QueueMutationDTO {
	api: IAPIResponse | undefined
	networkStatus: networkStatusTypes | null
	track: SermonItemDTO
	index?: number | undefined
	tracklist: SermonItemDTO[]
	queue: Queue
	queuingType?: QueuingType | undefined
	shuffled?: boolean | undefined
	startPlayback?: boolean | undefined
	/** When set, used to extend thin queues (e.g. resume single item). Defaults in {@link useLoadNewQueue}. */
	autoplayCatalogTail?: SermonItemDTO[] | undefined
	/** Prefer same minister/artist when merging autoplay tail. */
	autoplayPreferMinister?: string | null | undefined
}

/**
 * A mutation to handle adding a track to the queue.
 */
export interface AddToQueueMutation {
	api: IAPIResponse | undefined
	networkStatus: networkStatusTypes | null
	tracks: SermonItemDTO[]
	queuingType?: QueuingType | undefined
}

/**
 * A mutation to handle reordering the queue.
 */
export interface QueueOrderMutation {
	from: number
	to: number
}
