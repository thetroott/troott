import { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { useContextType } from '@/context';
import { useFavoriteSermonIdsStore } from '@/engine/state/favorite-sermon-ids-store';

import api from '../../api';
import { libraryKeys } from '../../query-keys';
import {
    favoriteIdsFromLibrary,
    LibraryNotFoundError,
    syncLibraryFavorite,
} from '../../services/sync-library-favorite';
import { useLibrarySessionEnabled, useUserLibraryQuery } from './useLibrary';

export { useIsSermonFavorite } from '@/engine/state/favorite-sermon-ids-store';
export { LibraryNotFoundError } from '../../services/sync-library-favorite';

/**
 * Syncs local favorite toggle to listener library (`PUT /library/user/:userId`).
 */
export function useSyncLibraryFavoriteMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useMutation({
        mutationFn: async ({
            sermonId,
            favourite,
        }: {
            sermonId: string;
            favourite: boolean;
        }) => {
            if (!userId) {
                throw new Error('Not signed in');
            }
            await syncLibraryFavorite(userId, sermonId, favourite);
        },
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({
                    queryKey: libraryKeys.user(userId),
                });
            }
        },
    });
}

export function useToggleFavoriteWithSync() {
    const sync = useSyncLibraryFavoriteMutation();
    const toggleFavorite = useFavoriteSermonIdsStore((s) => s.toggleFavorite);
    const isFavorite = useFavoriteSermonIdsStore((s) => s.isFavorite);
    const sessionEnabled = useLibrarySessionEnabled();

    const toggle = useCallback(
        async (sermonId: string) => {
            if (!sermonId) {
                return;
            }

            const next = !isFavorite(sermonId);
            toggleFavorite(sermonId);

            if (!sessionEnabled) {
                return;
            }

            try {
                await sync.mutateAsync({ sermonId, favourite: next });
            } catch (e) {
                toggleFavorite(sermonId);
                if (e instanceof LibraryNotFoundError) {
                    toast.error(
                        'Your library is not ready yet. Favorite saved on this device only.',
                    );
                } else if (e instanceof Error) {
                    toast.error(e.message || 'Could not sync favorite');
                }
            }
        },
        [isFavorite, sessionEnabled, toggleFavorite, sync],
    );

    return {
        isFavorite,
        toggle,
        isPending: sync.isPending,
    };
}

/** Merge server-favourited sermon ids into local MMKV store after library fetch. */
export function useHydrateFavoritesFromLibrary() {
    const sessionEnabled = useLibrarySessionEnabled();
    const { data: library } = useUserLibraryQuery(sessionEnabled);
    const mergeIds = useFavoriteSermonIdsStore((s) => s.mergeIds);

    useEffect(() => {
        if (!library) {
            return;
        }
        const ids = favoriteIdsFromLibrary(library);
        if (ids.length > 0) {
            mergeIds(ids);
        }
    }, [library, mergeIds]);
}

export function FavoritesHydrator() {
    useHydrateFavoritesFromLibrary();
    return null;
}
