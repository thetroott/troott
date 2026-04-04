
import { SermonTrackDTO } from '@/dtos/sermon.dto'
import {
	ACTIVE_INDEX_QUERY_KEY,
	NOW_PLAYING_QUERY_KEY,
	PLAY_QUEUE_QUERY_KEY,
	REPEAT_MODE_QUERY_KEY,
} from './query-keys'
import TrackPlayer, { Track } from 'react-native-track-player'
import { DownloadQueryKeys } from '../types/queries-type'
import { getAudioCache } from '@/engine/utils/offline'

const PLAYER_QUERY_OPTIONS = {
	enabled: true,
	retry: false,
	staleTime: Infinity,
	gcTime: Infinity,
	refetchOnWindowFocus: false,
	refetchOnReconnect: false,
	networkMode: 'always',
} as const

export const QUEUE_QUERY = {
	queryKey: PLAY_QUEUE_QUERY_KEY,
	queryFn: TrackPlayer.getQueue,
	select: (data: Track[]) => data as SermonTrackDTO[],
	...PLAYER_QUERY_OPTIONS,
}

export const CURRENT_INDEX_QUERY = {
	queryKey: ACTIVE_INDEX_QUERY_KEY,
	queryFn: TrackPlayer.getActiveTrackIndex,
	...PLAYER_QUERY_OPTIONS,
}

export const NOW_PLAYING_QUERY = {
	queryKey: NOW_PLAYING_QUERY_KEY,
	queryFn: TrackPlayer.getActiveTrack,
	select: (data: Track | undefined) => data as SermonTrackDTO | undefined,
	...PLAYER_QUERY_OPTIONS,
}

export const REPEAT_MODE_QUERY = {
	queryKey: REPEAT_MODE_QUERY_KEY,
	queryFn: TrackPlayer.getRepeatMode,
	...PLAYER_QUERY_OPTIONS,
}


export const AUDIO_CACHE_QUERY = {
	queryKey: [DownloadQueryKeys.DownloadedTracks],
	queryFn: getAudioCache,
	staleTime: Infinity, // Never stale, we will manually refetch when downloads are completed
}

interface MediaInfoQueryProps {
	api: string| undefined
	deviceProfile: "" | undefined
	itemId: string | null | undefined
}

export const MediaInfoQueryKey = ({ api, deviceProfile, itemId }: MediaInfoQueryProps) => [
	'MEDIA_INFO',
	api,
	// deviceProfile?.Id,
	itemId,
]



