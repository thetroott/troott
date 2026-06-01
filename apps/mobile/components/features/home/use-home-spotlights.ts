import { useCallback, useMemo } from 'react';

import {
    useLibrarySessionEnabled,
    useUserLibraryQuery,
} from '@/api/hooks/app/useLibrary';
import { useDiscoveryHomeRails } from '@/engine/hooks/useDiscoveryHomeRails';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { useFavoriteSermonIdsStore } from '@/engine/state/favorite-sermon-ids-store';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import {
    getLibraryArrayField,
    mapSermonDocsToItems,
} from '@/engine/utils/library-map';
import { useNetworkStatus } from '@/lib/state/network-store';
import { networkStatusTypes } from '@/api/dtos/network.dto';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import { QueuingType } from '@/api/types';

export type SpotlightCover = {
    key: string;
    uri?: string;
};

/** Troott Highlights — newest published discovery rail. */
export function useHomeHighlights() {
    const { recentlyPublished, isLoading } = useDiscoveryHomeRails();
    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();

    const tracklist = useMemo((): SermonItemDTO[] => {
        return recentlyPublished.map((r, i) =>
            catalogRowToSermonItem({
                ...r,
                id: r.id != null ? String(r.id) : `highlight-${i}`,
            }),
        );
    }, [recentlyPublished]);

    const covers = useMemo((): SpotlightCover[] => {
        return recentlyPublished.slice(0, 4).map((row, i) => ({
            key: row.id != null ? String(row.id) : `cover-${i}`,
            uri:
                typeof row.image === 'string' && row.image.length > 0
                    ? row.image
                    : undefined,
        }));
    }, [recentlyPublished]);

    const playHighlights = useCallback(() => {
        const first = tracklist[0];
        if (!first?.id) return;
        void loadNewQueue({
            api: undefined,
            networkStatus: networkStatus ?? networkStatusTypes.ONLINE,
            track: first,
            tracklist,
            index: 0,
            queue: 'Instant Mix',
            queuingType: QueuingType.FromSelection,
            startPlayback: true,
        });
    }, [loadNewQueue, networkStatus, tracklist]);

    return {
        covers,
        tracklist,
        count: recentlyPublished.length,
        isLoading,
        playHighlights,
        hasContent: tracklist.length > 0,
    };
}

/** Liked by you — library liked sermons with local favorites fallback count. */
export function useHomeLikedByYou() {
    const sessionReady = useLibrarySessionEnabled();
    const { data: lib, isLoading: libraryLoading } =
        useUserLibraryQuery(sessionReady);
    const favoriteIds = useFavoriteSermonIdsStore((s) => s.ids);

    const likedItems = useMemo(
        () =>
            mapSermonDocsToItems(
                getLibraryArrayField(lib, 'likedSermons', 'likedsermons'),
            ),
        [lib],
    );

    const covers = useMemo((): SpotlightCover[] => {
        return likedItems.slice(0, 4).map((item, i) => {
            const image =
                typeof item.image === 'string'
                    ? item.image
                    : undefined;
            return {
                key: item.id ?? `liked-${i}`,
                uri: image,
            };
        });
    }, [likedItems]);

    const count = likedItems.length > 0 ? likedItems.length : favoriteIds.length;

    return {
        covers,
        likedItems,
        count,
        isLoading: sessionReady && libraryLoading && likedItems.length === 0,
        hasContent: count > 0,
    };
}
