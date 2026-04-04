import { useMutation } from "@tanstack/react-query"
import useHapticFeedback from "../../hooks/shared/use-haptic-feedback"
import TrackPlayer, { RepeatMode, State } from "react-native-track-player"
import usePlayerEngineStore, { PlayerEngine } from "@/stores/player/engine"
import { useRemoteMediaClient } from "react-native-google-cast"
import { useCallback } from "react"
import { usePlayerQueueStore } from "@/stores/player/queue"
import { AddToQueueMutation, QueueMutationDTO, QueueOrderMutation } from "@/dtos/player.dto"
import { loadQueue, playLaterInQueue, playNextInQueue } from "@/engine/core/queue"
import { QueuingType } from "@/utils/enums.util"
import Toast from "react-native-toast-message"
import { SermonTrackDTO } from "@/dtos/sermon.dto"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { previous, skip } from "@/engine/core/skip-previous"
import { isUndefined } from "lodash"
import { handleDeshuffle, handleShuffle } from "@/engine/core/shuffle"
import { useUpdateOptions } from "../player/useUpdateOptions"
import { useTrackStore } from "@/stores/player-store"




/**
 * A mutation to handle starting playback
 */
export const usePlay = () => {

	const trigger = useHapticFeedback()

	return useMutation({
		onMutate: () => trigger('impactLight'),
		mutationFn: TrackPlayer.play,
	})
}



/**
 * A mutation to handle toggling the playback state
 */
export const useTogglePlayback = () => {

	const isCasting =
		usePlayerEngineStore((state) => state.playerEngineData) === PlayerEngine.GOOGLE_CAST
	const remoteClient = useRemoteMediaClient()

	const trigger = useHapticFeedback()

	return useCallback(async () => {
		trigger('impactMedium')
		const { state } = await TrackPlayer.getPlaybackState()

		if (state === State.Playing) {
			console.debug('Pausing playback')
			// handlePlaybackStateChanged(State.Paused)
			if (isCasting && remoteClient) {
				remoteClient.pause()
				return
			} else {
				TrackPlayer.pause()
				return
			}
		}

		const { duration, position } = await TrackPlayer.getProgress()
		if (isCasting && remoteClient) {
			const mediaStatus = await remoteClient.getMediaStatus()
			const streamPosition = mediaStatus?.streamPosition
			if (streamPosition && duration <= streamPosition) {
				await remoteClient.seek({
					position: 0,
					resumeState: 'play',
				})
			}
			await remoteClient.play()
			return
		}
		// if the track has ended, seek to start and play
		if (duration <= position) {
			await TrackPlayer.seekTo(0)
		}

		// handlePlaybackStateChanged(State.Playing)
		return TrackPlayer.play()
	}, [isCasting, remoteClient, trigger])
}

/** Like {@link useTogglePlayback} but updates legacy {@link useTrackStore} play/pause for shells that still read it. */
export const useLegacySyncedTogglePlayback = () => {
	const toggle = useTogglePlayback()

	return useCallback(async () => {
		await toggle()
		const { state } = await TrackPlayer.getPlaybackState()
		if (state === State.Playing) {
			useTrackStore.getState().play()
		} else {
			useTrackStore.getState().pause()
		}
	}, [toggle])
}




export const useToggleRepeatMode = () => {

	const trigger = useHapticFeedback()

	return useCallback(async () => {
		trigger('impactLight')
		const currentMode = await TrackPlayer.getRepeatMode()
		let nextMode: RepeatMode

		switch (currentMode) {
			case RepeatMode.Off:
				nextMode = RepeatMode.Queue
				break
			case RepeatMode.Queue:
				nextMode = RepeatMode.Track
				break
			default:
				nextMode = RepeatMode.Off
		}

		await TrackPlayer.setRepeatMode(nextMode)
		usePlayerQueueStore.getState().setRepeatMode(nextMode)
	}, [trigger])
}

export type LegacyRepeatMode = 'off' | 'all' | 'one'

/**
 * Maps legacy UI repeat ("off" | "all" | "one") to RNTP {@link RepeatMode} and queue store.
 */
export const useApplyLegacyRepeatMode = () => {
	const trigger = useHapticFeedback()

	return useCallback(
		async (mode: LegacyRepeatMode) => {
			trigger('impactLight')
			const rnMode =
				mode === 'off' ? RepeatMode.Off : mode === 'one' ? RepeatMode.Track : RepeatMode.Queue
			await TrackPlayer.setRepeatMode(rnMode)
			usePlayerQueueStore.getState().setRepeatMode(rnMode)
		},
		[trigger],
	)
}



/**
 * A mutation to handle seeking to a specific position in the track
 */
export const useSeekTo = () => {

	const isCasting =
		usePlayerEngineStore((state) => state.playerEngineData) === PlayerEngine.GOOGLE_CAST
	const remoteClient = useRemoteMediaClient()

	const trigger = useHapticFeedback()

	return useCallback(
		async (position: number) => {
			trigger('impactLight')

			console.log('position', position)
			if (isCasting && remoteClient) {
				await remoteClient.seek({
					position: position,
					resumeState: 'play',
				})
				return
			}
			await TrackPlayer.seekTo(position)
		},
		[isCasting, remoteClient, trigger],
	)
}

/**
 * A mutation to handle seeking to a specific position in the track
 */
export const useSeekBy = () => {

	const trigger = useHapticFeedback()

	return useCallback(
		async (seekSeconds: number) => {
			trigger('clockTick')

			await TrackPlayer.seekBy(seekSeconds)
		},
		[trigger],
	)
}


export const useAddToQueue = () => {
	const trigger = useHapticFeedback()

	return useCallback(async (data: AddToQueueMutation) => {
		try {
			if (data.queuingType === QueuingType.PlayingNext) playNextInQueue({ ...data })
			else playLaterInQueue({ ...data })

			trigger('notificationSuccess')
			console.debug(
				`${data.queuingType === QueuingType.PlayingNext ? 'Played next' : 'Added to queue'}`,
			)
			Toast.show({
				text1:
					data.queuingType === QueuingType.PlayingNext
						? 'Playing next'
						: 'Added to queue',
				type: 'success',
			})
		} catch (error) {
			trigger('notificationError')
			console.error(
				`Failed to ${data.queuingType === QueuingType.PlayingNext ? 'play next' : 'add to queue'}`,
				error,
			)
			Toast.show({
				text1:
					data.queuingType === QueuingType.PlayingNext
						? 'Failed to play next'
						: 'Failed to add to queue',
				type: 'error',
			})
		} finally {
			const newQueue = await TrackPlayer.getQueue()

			usePlayerQueueStore.getState().setQueue(newQueue as SermonTrackDTO[])
		}
	}, [])
}

export const useLoadNewQueue = () => {
	const isCasting =
		usePlayerEngineStore((state) => state.playerEngineData) === PlayerEngine.GOOGLE_CAST
	const remoteClient = useRemoteMediaClient()
	const navigation = useNavigation()
    //const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

	const trigger = useHapticFeedback()

	return useCallback(
		async (data: QueueMutationDTO) => {
			trigger('impactLight')
			await TrackPlayer.pause()
			const { finalStartIndex, tracks } = await loadQueue({ ...data })
			await useUpdateOptions(false)

			usePlayerQueueStore.getState().setCurrentIndex(finalStartIndex)

			console.debug('Successfully loaded new queue')
			if (isCasting && remoteClient) {
				await TrackPlayer.skip(finalStartIndex)
				//navigation.navigate('PlayerRoot', { screen: 'PlayerScreen' })
				return
			}

			await TrackPlayer.skip(finalStartIndex)

			if (data.startPlayback) await TrackPlayer.play()

			usePlayerQueueStore.getState().setQueueRef(data.queue)
			usePlayerQueueStore.getState().setQueue(tracks)
			usePlayerQueueStore.getState().setCurrentTrack(tracks[finalStartIndex])
		},
		[isCasting, remoteClient, navigation, trigger, usePlayerQueueStore],
	)
}

export const usePrevious = () => {
	const trigger = useHapticFeedback()

	return useCallback(async () => {
		trigger('impactMedium')

		await previous()
		console.debug('Skipped to previous track')
	}, [trigger])
}

export const useSkip = () => {
	const trigger = useHapticFeedback()

	return useCallback(
		async (index?: number | undefined) => {
			trigger('impactMedium')

			console.debug(
				`Skip to next triggered. ${!isUndefined(index) ? `Index is using ${index} as index since it was provided` : ''}`,
			)
			await skip(index)
			console.debug('Skipped to next track')
		},
		[trigger],
	)
}

export const useRemoveFromQueue = () => {
	const trigger = useHapticFeedback()

	return useMutation({
		onMutate: () => trigger('impactMedium'),
		mutationFn: async (index: number) => TrackPlayer.remove([index]),
		onSuccess: async (data: void, index: number) => {
			console.debug(`Removed track at index ${index}`)
		},
		onError: async (error: Error, index: number) => {
			console.error(`Failed to remove track at index ${index}:`, error)
		},
		onSettled: async () => {
			const newQueue = await TrackPlayer.getQueue()

			usePlayerQueueStore.getState().setQueue(newQueue as SermonTrackDTO[])
		},
	})
}

export const useRemoveUpcomingTracks = () => {
	const trigger = useHapticFeedback()

	return useMutation({
		mutationFn: TrackPlayer.removeUpcomingTracks,
		onSuccess: () => trigger('notificationSuccess'),
		onError: async (error: Error) => {
			trigger('notificationError')
			console.error('Failed to remove upcoming tracks:', error)
		},
		onSettled: async () => {
			const newQueue = await TrackPlayer.getQueue()

			usePlayerQueueStore.getState().setQueue(newQueue as SermonTrackDTO[])
		},
	})
}

export const useReorderQueue = () => {
	const trigger = useHapticFeedback()

	return useMutation({
		mutationFn: async ({ from, to }: QueueOrderMutation) => {
			console.debug(
				`TrackPlayer.move(${from}, ${to}) - Queue before move:`,
				(await TrackPlayer.getQueue()).length,
			)

			await TrackPlayer.move(from, to)
		},
		onMutate: async ({ from, to }: { from: number; to: number }) => {
			console.debug(`Reordering queue from ${from} to ${to}`)
		},
		onSuccess: async (_, { from, to }: { from: number; to: number }) => {
			console.debug(`Reordered queue from ${from} to ${to} successfully`)
		},
		onError: async (error: Error) => {
			trigger('notificationError')
			console.error('Failed to reorder queue:', error)
		},
		onSettled: async () => {
			const newQueue = await TrackPlayer.getQueue()

			usePlayerQueueStore.getState().setQueue(newQueue as SermonTrackDTO[])
		},
	})
}

export const useResetQueue = () =>
	useMutation({
		mutationFn: async () => {
			usePlayerQueueStore.getState().setUnshuffledQueue([])
			usePlayerQueueStore.getState().setShuffled(false)
			usePlayerQueueStore.getState().setQueueRef('Recently Played')
			usePlayerQueueStore.getState().setQueue([])
			usePlayerQueueStore.getState().setCurrentTrack(undefined)
			usePlayerQueueStore.getState().setCurrentIndex(undefined)
			await TrackPlayer.reset()
		},
	})

export const useToggleShuffle = () => {
	const trigger = useHapticFeedback()

	return useMutation({
		onMutate: () => trigger('impactLight'),
		mutationFn: async (shuffled: boolean) =>
			shuffled ? await handleDeshuffle() : await handleShuffle(),
		onError: (error) => {
			console.error('Failed to toggle shuffle:', error)
			Toast.show({
				text1: 'Failed to toggle shuffle',
				type: 'error',
			})
		},
		onSuccess: async (_, shuffled) => {
			const newQueue = await TrackPlayer.getQueue()
			usePlayerQueueStore.getState().setQueue(newQueue as SermonTrackDTO[])

			usePlayerQueueStore.getState().setShuffled(!shuffled)
		},
	})
}




// ### 1. **Play / Pause / Toggle Playback**

// * `usePlay()` → starts playing the current track.
// * `useTogglePlayback()` → toggles between play and pause.
// * Handles both **local playback via `react-native-track-player`** and **casting via Google Cast**.
// * Resets the track if it’s ended and you press play.

// ---

// ### 2. **Repeat & Shuffle**

// * `useToggleRepeatMode()` → cycles between repeat off, repeat queue, repeat track.
// * `useToggleShuffle()` → shuffles or deshuffles the current queue.
// * Updates **player queue store** so UI can reflect the current mode.
// * Can trigger haptic feedback and show success/error toasts.

// ---

// ### 3. **Seeking**

// * `useSeekTo(position)` → jump to a specific time in the track.
// * `useSeekBy(seconds)` → jump forward or backward by a relative number of seconds.
// * Works for both local playback and casting.

// ---

// ### 4. **Queue Management**

// * `useLoadNewQueue()` → replace the current queue with a new one (e.g., album, playlist).
// * `useAddToQueue()` → add tracks to the queue, either **next** or **later**.
// * `useRemoveFromQueue()` → remove a track by index.
// * `useRemoveUpcomingTracks()` → clear all upcoming tracks.
// * `useReorderQueue()` → move a track from one position to another.
// * `useResetQueue()` → clear the queue completely.

// ---

// ### 5. **Skip / Previous**

// * `useSkip(index?)` → skip to the next track, optionally to a specific index.
// * `usePrevious()` → go back to the previous track.

// ---

// ### 6. **Integration with State & Feedback**

// * Updates **`usePlayerQueueStore`** so UI components always have the current queue, track, and playback info.
// * Triggers **haptic feedback** on interactions.
// * Shows **success/error messages via `Toast`** for user feedback.
// * Handles **casting vs local playback automatically**.

// ---

// ### ✅ **Why This Approach Is Useful**

// 1. **Centralized logic:** All player operations are in hooks, reusable anywhere in the app.
// 2. **Works with React Query:** Can easily track mutation states (loading, success, error).
// 3. **Cross-platform support:** Works locally and with Google Cast.
// 4. **Queue-aware:** All operations respect the current queue state.
// 5. **User feedback & UX:** Haptics + toasts make the app feel responsive.
// 6. **Composable:** Each hook focuses on one action; you can mix and match in UI.

// ---

// In short, this is basically the **“Spotify player engine”** layer of your app. It doesn’t deal with the UI but manages **everything a user can do to playback, queue, shuffle, repeat, seek, and cast music**.

// ---

// If you want, I can draw a **diagram showing how all these hooks interact with TrackPlayer, queue store, casting, and the UI**, which makes it super clear what each part does. Do you want me to do that?
