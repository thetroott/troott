import TrackPlayer from 'react-native-track-player'
import { queryClient } from '../../services/query-client'
import { ACTIVE_INDEX_QUERY_KEY, NOW_PLAYING_QUERY_KEY, PLAY_QUEUE_QUERY_KEY } from '@/engine/queries/query-keys'
import { SermonTrackDTO } from '@/dtos/sermon.dto'
import { usePlayerQueueStore } from '@/stores/player/queue'
import { useTrackStore } from '@/stores/player-store'


export function getActiveIndex(): number | undefined {
	return queryClient.getQueryData(ACTIVE_INDEX_QUERY_KEY) as number | undefined
}

export function setActiveIndex(index: number): void {
	queryClient.setQueryData(ACTIVE_INDEX_QUERY_KEY, index)
}

export function getCurrentTrack(): SermonTrackDTO | undefined {
	return queryClient.getQueryData(NOW_PLAYING_QUERY_KEY)
}

export function getPlayQueue(): SermonTrackDTO[] | undefined {
	return queryClient.getQueryData(PLAY_QUEUE_QUERY_KEY) as SermonTrackDTO[] | undefined
}

export function setPlayQueue(tracks: SermonTrackDTO[]): void {
	queryClient.setQueryData(PLAY_QUEUE_QUERY_KEY, tracks)
}

export async function handleActiveTrackChanged(): Promise<void> {
	const [queue, activeTrack, activeIndex] = await Promise.all([
		TrackPlayer.getQueue(),
		TrackPlayer.getActiveTrack(),
		TrackPlayer.getActiveTrackIndex(),
	])

	usePlayerQueueStore.getState().setQueue(queue as SermonTrackDTO[])
	usePlayerQueueStore.getState().setCurrentTrack(activeTrack as SermonTrackDTO)
	usePlayerQueueStore.getState().setCurrentIndex(activeIndex)

	if (activeTrack) {
		const t = activeTrack as SermonTrackDTO & {
			artist?: string
			artwork?: unknown
			image?: unknown
		}
		useTrackStore.getState().setCurrentTrack({
			...activeTrack,
			minister: t.minister ?? t.artist,
			image: t.image ?? t.artwork,
			artwork: t.artwork ?? t.image,
		} as unknown as SermonTrackDTO)
	}
}
