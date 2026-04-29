import auth from '@/api/auth';
import useHapticFeedback from '@/hooks/shared/use-haptic-feedback';
import type { SermonTrackDTO } from '@/types/sermon';
import { useMutation } from '@tanstack/react-query';
import { isUndefined } from 'lodash';
import Toast from 'react-native-toast-message';

interface SetFavoriteMutation {
    item: SermonTrackDTO;
    onToggle?: () => void;
}

export const useAddFavorite = () => {
    const api = auth;

    const trigger = useHapticFeedback();

    return useMutation({
        mutationFn: async ({ item }: SetFavoriteMutation) => {
            if (isUndefined(api)) Promise.reject('API instance not defined');
            const trackId = item.id ?? item.mediaId;
            if (!trackId) Promise.reject('Item ID is undefined');
        },
        onSuccess: (data, { item, onToggle }) => {
            Toast.show({
                text1: 'Added favorite',
                type: 'success',
            });

            trigger('notificationSuccess');

            if (onToggle) onToggle();
        },
        onError: (error, variables) => {
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
    const api = auth;

    const trigger = useHapticFeedback();

    return useMutation({
        mutationFn: async ({ item }: SetFavoriteMutation) => {
            if (isUndefined(api)) Promise.reject('API instance not defined');
            const trackId = item.id ?? item.mediaId;
            if (!trackId) Promise.reject('Item ID is undefined');
        },
        onSuccess: (data, { item, onToggle }) => {
            Toast.show({
                text1: 'Removed favorite',
                type: 'success',
            });

            trigger('notificationSuccess');

            if (onToggle) onToggle();
        },
        onError: (error, variables) => {
            console.error('Unable to remove favorite for item', error);

            trigger('notificationError');

            Toast.show({
                text1: 'Failed to remove favorite',
                type: 'error',
            });
        },
    });
};
