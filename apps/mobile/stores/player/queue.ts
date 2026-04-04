import { Queue } from '@/engine/types/type'

import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { RepeatMode } from 'react-native-track-player'
import { mmkvStateStorage } from '@/services/storage'
import { SermonTrackDTO } from '@/dtos/sermon.dto'



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
}

export const usePlayerQueueStore = create<PlayerQueueStore>()(
	devtools(
		persist(
			(set) => ({
				shuffled: false,
				setShuffled: (shuffled: boolean) => set({ shuffled }),

				repeatMode: RepeatMode.Off,
				setRepeatMode: (repeatMode: RepeatMode) => set({ repeatMode }),

				queueRef: 'Recently Played',
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
			}),
			{
				name: 'player-queue-storage',
				storage: createJSONStorage(() => mmkvStateStorage),
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
