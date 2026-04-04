import { UserDTO } from "@/dtos/user.dto"
import {PlayerQueryKeys} from "../types/queries-type"
import { SermonItemDTO } from "@/dtos/sermon.dto"
import { useQuery } from "@tanstack/react-query"
import auth from "@/api/auth"
import { QueryKeys } from "@/utils/enums.util"
import { useUserStore } from "@/stores/user-store"


export const ACTIVE_INDEX_QUERY_KEY = [PlayerQueryKeys.ActiveIndex]

export const NOW_PLAYING_QUERY_KEY = [PlayerQueryKeys.NowPlaying]

export const PLAY_QUEUE_QUERY_KEY = [PlayerQueryKeys.PlayQueue]

export const QUEUE_REF_QUERY_KEY = [PlayerQueryKeys.PlayQueueRef]

export const REPEAT_MODE_QUERY_KEY = [PlayerQueryKeys.RepeatMode]

export const UNSHUFFLED_QUEUE_QUERY_KEY = [PlayerQueryKeys.UnshuffledQueue]

export const SHUFFLED_QUERY_KEY = [PlayerQueryKeys.Shuffled]



export const UserDataQueryKey = (user: UserDTO, item: SermonItemDTO) => [
	QueryKeys.UserData,
	user.id as string,
	item.id as string,
]



export const useIsFavorite = (item: SermonItemDTO) => {
	const api = auth
	const user = useUserStore()

	return useQuery({
		queryKey: UserDataQueryKey(user!, item),
		queryFn: () => api,
		select: (data) => typeof data === 'object' && data.logoutUser,
		enabled: !!api && !!user && !!item.id, // Only run if we have the required data
	})
}


