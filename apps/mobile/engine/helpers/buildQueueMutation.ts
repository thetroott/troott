import type { IAPIResponse } from "@/utils/interface.utl"
import { networkStatusTypes } from "@/components/containers/shared/network-watcehr"
import type { QueueMutationDTO } from "@/dtos/player.dto"
import type { SermonItemDTO } from "@/dtos/sermon.dto"
import type { Queue } from "@/engine/types/type"

/**
 * Builds a {@link QueueMutationDTO} for {@link loadQueue} / {@link useLoadNewQueue}.
 */
export function buildQueueMutationFromList(opts: {
	tracklist: SermonItemDTO[]
	startIndex: number
	queue: Queue
	networkStatus?: networkStatusTypes | null
	api?: IAPIResponse | undefined
	startPlayback?: boolean
	shuffled?: boolean
}): QueueMutationDTO {
	const { tracklist, startIndex, queue, networkStatus, api, startPlayback = true, shuffled } = opts
	const track = tracklist[startIndex]
	if (!track) {
		throw new Error("buildQueueMutationFromList: invalid startIndex for tracklist")
	}
	return {
		api,
		networkStatus: networkStatus ?? networkStatusTypes.ONLINE,
		track,
		index: startIndex,
		tracklist,
		queue,
		startPlayback,
		shuffled,
	}
}
