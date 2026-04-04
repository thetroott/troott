import { networkStatusTypes } from "@/components/containers/shared/network-watcehr"
import { AddToQueueMutation, QueueMutationDTO } from "@/dtos/player.dto"
import { SermonTrackDTO } from "@/dtos/sermon.dto"
import { usePlayerQueueStore } from "@/stores/player/queue"
import { getAudioCache } from "@/engine/utils/offline"
import { filterTracksOnNetworkStatus, shuffleSermonTracks } from "../helpers/helpers"
import { mapDtoToTrack } from "@/engine/utils/mappers"
import { QueuingType } from "@/utils/enums.util"
import TrackPlayer from "react-native-track-player"
import { isUndefined } from "lodash"
import { getCurrentTrack } from "../queries/current-track"

type LoadQueueResult = {
	finalStartIndex: number
	tracks: SermonTrackDTO[]
}

export async function loadQueue({
	index,
	tracklist,
	queue: queueRef,
	shuffled = false,
	api,
	//deviceProfile,
	networkStatus = networkStatusTypes.ONLINE,
}: QueueMutationDTO): Promise<LoadQueueResult> {
	usePlayerQueueStore.getState().setQueueRef(queueRef)
	usePlayerQueueStore.getState().setShuffled(shuffled)

	const startIndex = index ?? 0

	// Get the item at the start index
	const startingTrack = tracklist[startIndex]

	const downloadedTracks = getAudioCache()

	const availableAudioItems = filterTracksOnNetworkStatus(
		networkStatus as networkStatusTypes,
		tracklist,
		downloadedTracks ?? [],
	)

	// Convert to SermonTrackDTOs first
	let queue = availableAudioItems.map((item) =>
		mapDtoToTrack("", item, QueuingType.FromSelection),
	)

	// Store the original unshuffled queue
	usePlayerQueueStore.getState().setUnshuffledQueue(queue)

	// Handle if a shuffle was requested
	if (shuffled && queue.length > 1) {
		console.debug('Shuffling queue...')

		const { shuffled: shuffledTracks } = shuffleSermonTracks(queue)
		queue = shuffledTracks
		console.debug(`Shuffled entire queue as fallback`)
	}

	// The start index for the shuffled queue is always 0 (starting track is first)
	const finalStartIndex = availableAudioItems.findIndex((item) => item.id === startingTrack.id)

	console.debug(
		`Filtered out ${
			tracklist.length - availableAudioItems.length
		} due to network status being ${networkStatus}`,
	)

	console.debug(`Final start index is ${finalStartIndex}`)

	await TrackPlayer.stop()

	/**
	 *  Keep the requested track as the currently playing track so there
	 * isn't any flickering in the miniplayer
	 */
	await TrackPlayer.setQueue([queue[finalStartIndex]])
	await TrackPlayer.add([...queue.slice(0, finalStartIndex), ...queue.slice(finalStartIndex + 1)])
	await TrackPlayer.move(0, finalStartIndex)

	console.debug(
		`Queued ${queue.length} tracks, starting at ${finalStartIndex}${shuffled ? ' (shuffled)' : ''}`,
	)

	return {
		finalStartIndex,
		tracks: queue,
	}
}

/**
 * Inserts a track at the next index in the queue
 *
 * Keeps a copy of the original queue in {@link unshuffledQueue}
 *
 * @param item The track to play next
 */
export const playNextInQueue = async ({ api, tracks }: AddToQueueMutation) => {
	const tracksToPlayNext = tracks.map((item) =>
		mapDtoToTrack('', item, QueuingType.PlayingNext),
	)

	const currentIndex = await TrackPlayer.getActiveTrackIndex()
	const currentQueue = (await TrackPlayer.getQueue()) as SermonTrackDTO[]

	console.debug(`Adding ${tracks.length} to the queue at index ${currentIndex}`)

	// If we're already at the end of the queue, add the track to the end
	if (currentIndex === currentQueue.length - 1) await TrackPlayer.add(tracksToPlayNext)
	// Else as long as we have an active index, we'll add the track(s) after that
	else if (!isUndefined(currentIndex)) await TrackPlayer.add(tracksToPlayNext, currentIndex + 1)

	// Get the active queue, put it in Zustand
	const updatedQueue = (await TrackPlayer.getQueue()) as SermonTrackDTO[]
	usePlayerQueueStore.getState().setQueue([...updatedQueue])

	// Add to the state unshuffled queue, using the currently playing track as the index
	usePlayerQueueStore
		.getState()
		.setUnshuffledQueue([
			...usePlayerQueueStore
				.getState()
				.unShuffledQueue.slice(
					0,
					usePlayerQueueStore.getState().unShuffledQueue.indexOf(getCurrentTrack()!) + 1,
				),
			...tracksToPlayNext,
			...usePlayerQueueStore
				.getState()
				.unShuffledQueue.slice(
					usePlayerQueueStore.getState().unShuffledQueue.indexOf(getCurrentTrack()!) + 1,
				),
		])
}

export const playLaterInQueue = async ({ api, tracks }: AddToQueueMutation) => {
	console.debug(`Adding ${tracks.length} to queue`)

	const newTracks = tracks.map((item) =>
		mapDtoToTrack('', item, QueuingType.DirectlyQueued),
	)

	// Then update RNTP
	await TrackPlayer.add(newTracks)

	const updatedQueue = (await TrackPlayer.getQueue()) as SermonTrackDTO[]
	usePlayerQueueStore.getState().setQueue(updatedQueue)

	// Update unshuffled queue with the same mapped tracks to avoid duplication
	usePlayerQueueStore
		.getState()
		.setUnshuffledQueue([...usePlayerQueueStore.getState().unShuffledQueue, ...newTracks])
}
