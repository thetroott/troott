import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContextType } from '@/context/apps/useContextType';
import api from '../../api';
import { libraryKeys } from '../../utils/query-keys';
import { useFavoriteSermonIdsStore } from '@/engine/state/favorite-sermon-ids-store';

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
            const libRes = await api.library.getLibraryByUser(userId);
            if (libRes.error) {
                throw new Error(libRes.message || 'Library not found');
            }
            const library = libRes.data as Record<string, unknown>;
            const items = Array.isArray(library.items) ? library.items : [];
            const nextItems = items.map((row) => {
                const item = row as Record<string, unknown>;
                const ref = item.sermon ?? item.itemId ?? item.id;
                const id =
                    typeof ref === 'object' && ref !== null
                        ? String((ref as Record<string, unknown>)._id ?? (ref as Record<string, unknown>).id ?? '')
                        : String(ref ?? '');
                if (id !== sermonId) {
                    return item;
                }
                return {
                    ...item,
                    flags: {
                        ...(typeof item.flags === 'object' && item.flags !== null
                            ? (item.flags as Record<string, unknown>)
                            : {}),
                        favourite,
                    },
                };
            });
            return api.library.updateLibrary(userId, {
                ...library,
                items: nextItems,
            });
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
    const { toggleFavorite, isFavorite } = useFavoriteSermonIdsStore.getState();

    return {
        isFavorite,
        toggle: async (sermonId: string) => {
            const next = !isFavorite(sermonId);
            toggleFavorite(sermonId);
            try {
                await sync.mutateAsync({ sermonId, favourite: next });
            } catch {
                toggleFavorite(sermonId);
            }
        },
        isPending: sync.isPending,
    };
}
