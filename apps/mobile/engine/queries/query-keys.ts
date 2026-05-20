import { PlayerQueryKeys } from '../types/queries-type';
import type { SermonItemDTO } from '@/types/sermon';
import { catalogUserDataKey } from '@/api/utils/query-keys';

export const ACTIVE_INDEX_QUERY_KEY = [PlayerQueryKeys.ActiveIndex];

export const NOW_PLAYING_QUERY_KEY = [PlayerQueryKeys.NowPlaying];

export const PLAY_QUEUE_QUERY_KEY = [PlayerQueryKeys.PlayQueue];

export const QUEUE_REF_QUERY_KEY = [PlayerQueryKeys.PlayQueueRef];

export const REPEAT_MODE_QUERY_KEY = [PlayerQueryKeys.RepeatMode];

export const UNSHUFFLED_QUEUE_QUERY_KEY = [PlayerQueryKeys.UnshuffledQueue];

export const SHUFFLED_QUERY_KEY = [PlayerQueryKeys.Shuffled];

export const UserDataQueryKey = (
    user: { id: string } | null | undefined,
    item: SermonItemDTO,
) => catalogUserDataKey(user?.id as string, item.id as string);
