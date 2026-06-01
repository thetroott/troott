import { useFavoriteSermonIdsStore } from '@/engine/state/favorite-sermon-ids-store';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

/**
 * Favorite state from the same persisted store as the mini-player heart control.
 */
export const useIsFavorite = (item: SermonItemDTO) => {
    const sermonId = item?.id != null ? String(item.id) : '';
    const isFavorite = useFavoriteSermonIdsStore((s) =>
        sermonId.length > 0 ? s.isFavorite(sermonId) : false,
    );

    return {
        data: isFavorite,
        isPending: false,
        isFetching: false,
        isError: false,
    };
};
