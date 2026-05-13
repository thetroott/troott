import useHapticFeedback from '@/api/hooks/shared/use-haptic-feedback';
import { useFavoriteSermonIdsStore } from '@/engine/state/favorite-sermon-ids-store';
import type { SermonTrackDTO } from '@/types/sermon';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

interface SetFavoriteMutation {
    item: SermonTrackDTO;
    onToggle?: () => void;
}

function resolveSermonId(item: SermonTrackDTO): string | null {
    const fromItem = item.item?.id;
    if (fromItem != null && String(fromItem).length > 0) {
        return String(fromItem);
    }
    const legacy = item.id ?? item.mediaId;
    if (legacy != null && String(legacy).length > 0) {
        return String(legacy);
    }
    return null;
}

/**
 * Persists "favorite" to the local MMKV-backed store (same source as mini-player heart).
 * Server sync can be layered on later without changing call sites.
 */
export const useAddFavorite = () => {
    const trigger = useHapticFeedback();

    return useMutation({
        mutationFn: async ({ item }: SetFavoriteMutation) => {
            const sermonId = resolveSermonId(item);
            if (!sermonId) {
                throw new Error('Sermon id is required');
            }
            const { isFavorite, toggleFavorite } =
                useFavoriteSermonIdsStore.getState();
            if (!isFavorite(sermonId)) {
                toggleFavorite(sermonId);
            }
        },
        onSuccess: (_data, { onToggle }) => {
            Toast.show({
                text1: 'Added favorite',
                type: 'success',
            });

            trigger('notificationSuccess');

            onToggle?.();
        },
        onError: (error) => {
            console.error('Unable to set favorite for item', error);

            trigger('notificationError');

            Toast.show({
                text1: 'Failed to add favorite',
                type: 'error',
            });
        },
    });
};

export const useRemoveFavorite = () => {
    const trigger = useHapticFeedback();

    return useMutation({
        mutationFn: async ({ item }: SetFavoriteMutation) => {
            const sermonId = resolveSermonId(item);
            if (!sermonId) {
                throw new Error('Sermon id is required');
            }
            const { isFavorite, toggleFavorite } =
                useFavoriteSermonIdsStore.getState();
            if (isFavorite(sermonId)) {
                toggleFavorite(sermonId);
            }
        },
        onSuccess: (_data, { onToggle }) => {
            Toast.show({
                text1: 'Removed favorite',
                type: 'success',
            });

            trigger('notificationSuccess');

            onToggle?.();
        },
        onError: (error) => {
            console.error('Unable to remove favorite for item', error);

            trigger('notificationError');

            Toast.show({
                text1: 'Failed to remove favorite',
                type: 'error',
            });
        },
    });
};
