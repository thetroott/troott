import { useMemo } from "react"
import { RepeatMode } from "@rntp/player"

import {
	useCurrentIndex,
	useCurrentTrack,
	useLastPlayed,
	usePlayQueue,
	useRepeatModeStoreValue,
} from "@/stores/player/queue"

/** Matches mini / full player "Next" availability vs TrackPlayer queue + repeat mode. */
export function useCanSkipNext(): boolean {
	const currentTrack = useCurrentTrack()
	const queue = usePlayQueue()
	const currentIndex = useCurrentIndex()
	const lastPlayed = useLastPlayed()
	const repeatMode = useRepeatModeStoreValue()

	const queueFallback =
		currentIndex != null && currentIndex >= 0 && currentIndex < queue.length
			? queue[currentIndex]
			: undefined
	const displayTrack = currentTrack ?? queueFallback
	const lastPlayedOnly = !displayTrack && Boolean(lastPlayed?.sermonId)

	return useMemo(() => {
		if (lastPlayedOnly || queue.length === 0) return false
		if (repeatMode === RepeatMode.All || repeatMode === RepeatMode.One) return true
		if (currentIndex == null) return false
		return currentIndex < queue.length - 1
	}, [lastPlayedOnly, queue.length, repeatMode, currentIndex])
}
