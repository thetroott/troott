import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { RepeatMode } from "@rntp/player"

import type { Queue } from "@/types/queue-ref"
import type { SermonTrackDTO } from "@/types/sermon"
import { mmkvStateStorage } from "@/services/storage"

export type LastPlayedSummary = {
	sermonId: string
	title: string
	artist: string
	artworkUrl?: string
	durationSec: number
	lastPositionSec: number
	/** Persisted stream URL for resume when catalog is unavailable */
	streamUrl: string
}

type PlayerQueueStore = {
	shuffled: boolean
	setShuffled: (shuffled: boolean) => void

	repeatMode: RepeatMode
	setRepeatMode: (repeatMode: RepeatMode) => void

	queueRef: Queue
	setQueueRef: (queueRef: Queue) => void

	unShuffledQueue: SermonTrackDTO[]
	setUnshuffledQueue: (unShuffledQueue: SermonTrackDTO[]) => void

	queue: SermonTrackDTO[]
	setQueue: (queue: SermonTrackDTO[]) => void

	currentTrack: SermonTrackDTO | undefined
	setCurrentTrack: (track: SermonTrackDTO | undefined) => void

	currentIndex: number | undefined
	setCurrentIndex: (index: number | undefined) => void

	lastPlayed: LastPlayedSummary | undefined
	setLastPlayed: (summary: LastPlayedSummary | undefined) => void
}

export const usePlayerQueueStore = create<PlayerQueueStore>()(
	devtools(
		persist(
			(set): PlayerQueueStore => ({
				shuffled: false,
				setShuffled: (shuffled: boolean) => set({ shuffled }),

				repeatMode: RepeatMode.Off,
				setRepeatMode: (repeatMode: RepeatMode) => set({ repeatMode }),

				queueRef: "Recently Played",
				setQueueRef: (queueRef) =>
					set({
						queueRef,
					}),

				unShuffledQueue: [],
				setUnshuffledQueue: (unShuffledQueue: SermonTrackDTO[]) =>
					set({
						unShuffledQueue,
					}),

				queue: [],
				setQueue: (queue: SermonTrackDTO[]) =>
					set({
						queue,
					}),

				currentTrack: undefined,
				setCurrentTrack: (currentTrack: SermonTrackDTO | undefined) =>
					set({
						currentTrack,
					}),

				currentIndex: undefined,
				setCurrentIndex: (currentIndex: number | undefined) =>
					set({
						currentIndex,
					}),

				lastPlayed: undefined,
				setLastPlayed: (lastPlayed: LastPlayedSummary | undefined) => set({ lastPlayed }),
			}),
			{
				name: "player-queue-storage",
				storage: createJSONStorage(() => mmkvStateStorage),
				partialize: (state) => ({
					shuffled: state.shuffled,
					repeatMode: state.repeatMode,
					queueRef: state.queueRef,
					unShuffledQueue: state.unShuffledQueue,
					queue: state.queue,
					currentTrack: state.currentTrack,
					currentIndex: state.currentIndex,
					lastPlayed: state.lastPlayed,
				}),
			},
		),
	),
)

export const usePlayQueue = () => usePlayerQueueStore((state) => state.queue)

export const useShuffle = () => usePlayerQueueStore((state) => state.shuffled)

export const useQueueRef = () => usePlayerQueueStore((state) => state.queueRef)

export const useCurrentTrack = () => usePlayerQueueStore((state) => state.currentTrack)

export const useCurrentIndex = () => usePlayerQueueStore((state) => state.currentIndex)

export const useRepeatModeStoreValue = () => usePlayerQueueStore((state) => state.repeatMode)

export const useLastPlayed = () => usePlayerQueueStore((state) => state.lastPlayed)
