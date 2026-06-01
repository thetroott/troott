import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/api/services/mmkv-storage';

type FavoriteSermonIdsStore = {
    ids: string[];
    toggleFavorite: (sermonId: string) => void;
    isFavorite: (sermonId: string) => boolean;
    mergeIds: (ids: string[]) => void;
};

export const useFavoriteSermonIdsStore = create<FavoriteSermonIdsStore>()(
    persist(
        (set, get) => ({
            ids: [],
            toggleFavorite: (sermonId: string) => {
                if (!sermonId) return;
                const cur = get().ids;
                const has = cur.includes(sermonId);
                set({
                    ids: has
                        ? cur.filter((id) => id !== sermonId)
                        : [...cur, sermonId],
                });
            },
            isFavorite: (sermonId: string) => {
                if (!sermonId) return false;
                return get().ids.includes(sermonId);
            },
            mergeIds: (ids: string[]) => {
                const incoming = ids.filter(Boolean);
                if (incoming.length === 0) {
                    return;
                }
                const cur = get().ids;
                const merged = [...cur];
                for (const id of incoming) {
                    if (!merged.includes(id)) {
                        merged.push(id);
                    }
                }
                if (merged.length !== cur.length) {
                    set({ ids: merged });
                }
            },
        }),
        {
            name: 'favorite-sermon-ids',
            storage: createJSONStorage(() => mmkvStateStorage),
            partialize: (s) => ({ ids: s.ids }),
        },
    ),
);

export const useIsSermonFavorite = (sermonId: string | undefined) =>
    useFavoriteSermonIdsStore((s) =>
        sermonId ? s.ids.includes(sermonId) : false,
    );
