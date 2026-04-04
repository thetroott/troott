import { useCallback } from "react"
import { tracks } from "@/_data/_mock/tracks"
import type { Queue } from "@/engine/types/type"
import type { SermonItemDTO, SermonTrackDTO } from "@/dtos/sermon.dto"
import { useTrackStore } from "@/stores/player-store"
import { useNetworkStatus } from "@/stores/app/network"
import { usePlayerQueueStore } from "@/stores/player/queue"
import { buildQueueMutationFromList } from "@/engine/helpers/buildQueueMutation"
import { mockSermonRowToItem } from "@/engine/helpers/mockSermonRowToItem"
import { useLoadNewQueue } from "@/engine/hooks/useControl"
import { useSermonsCatalogQuery } from "@/engine/hooks/useSermonsCatalogQuery"

/** Any catalog or UI row with a stable `id` used to resolve the start index. */
export type PlayCatalogRef = Pick<SermonItemDTO, "id">

/**
 * Loads the sermons catalog (or mock fallback) into TrackPlayer starting at the given track,
 * and syncs legacy {@link useTrackStore} for the mini / full player shell.
 */
export function usePlayFromCatalog(queueRef: Queue = "Library") {
	const { data: sermons } = useSermonsCatalogQuery()
	const loadNewQueue = useLoadNewQueue()
	const [networkStatus] = useNetworkStatus()
	const setCurrentTrack = useTrackStore((s) => s.setCurrentTrack)
	const setShowMiniPlayer = useTrackStore((s) => s.setShowMiniPlayer)

	return useCallback(
		async (track: PlayCatalogRef) => {
			const fallbackItems: SermonItemDTO[] = tracks.map((row) =>
				mockSermonRowToItem(row as Parameters<typeof mockSermonRowToItem>[0]),
			)
			const tracklist: SermonItemDTO[] =
				sermons && sermons.length > 0 ? sermons : fallbackItems
			const index = tracklist.findIndex((t) => t.id === track.id)
			if (index === -1) return

			await loadNewQueue(
				buildQueueMutationFromList({
					tracklist,
					startIndex: index,
					queue: queueRef,
					networkStatus,
					api: undefined,
					startPlayback: true,
				}),
			)

			const current = usePlayerQueueStore.getState().currentTrack
			if (current) {
				setCurrentTrack(current as SermonTrackDTO)
				setShowMiniPlayer(true)
			}
		},
		[sermons, loadNewQueue, networkStatus, queueRef, setCurrentTrack, setShowMiniPlayer],
	)
}
