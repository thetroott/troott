import { useMemo } from 'react';

import {
    useLibrarySessionEnabled,
    useUserLibraryQuery,
} from '@/api/hooks/app/useLibrary';
import { useDiscoveryHomeRails } from '@/engine/hooks/useDiscoveryHomeRails';
import {
    getLibraryArrayField,
    mapSermonDocsToItems,
} from '@/engine/utils/library-map';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import type { ISermonTrack } from '@/api/dtos/sermon.dto';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

export type SeeMoreRailKey = 'forYou' | 'top' | 'minister' | 'recentlyPlayed';

function rowsToSermonItems(rows: ISermonTrack[]): SermonItemDTO[] {
    return rows.map((r, i) =>
        catalogRowToSermonItem({
            ...r,
            id: r.id != null ? String(r.id) : `see-more-${i}`,
        }),
    );
}

/**
 * Sermon lists for home see-more screens — discovery rails + library history.
 */
export function useSeeMoreSermons(rail: SeeMoreRailKey) {
    const discovery = useDiscoveryHomeRails();
    const sessionReady = useLibrarySessionEnabled();
    const libraryQuery = useUserLibraryQuery(
        sessionReady && rail === 'recentlyPlayed',
    );

    const items = useMemo((): SermonItemDTO[] => {
        if (rail === 'forYou') {
            const rows =
                discovery.popularRecentlyPlayed.length > 0
                    ? discovery.popularRecentlyPlayed
                    : discovery.recentlyPublished;
            return rowsToSermonItems(rows);
        }

        if (rail === 'top') {
            return rowsToSermonItems(discovery.mostPlayed);
        }

        if (rail === 'minister') {
            const rows =
                discovery.featuredMinister &&
                discovery.featuredMinister.sermons.length > 0
                    ? discovery.featuredMinister.sermons
                    : discovery.mostPlayed;
            return rowsToSermonItems(rows);
        }

        const historyDocs = [
            ...getLibraryArrayField(libraryQuery.data, 'listeningHistory'),
            ...getLibraryArrayField(libraryQuery.data, 'recentlyPlayed'),
        ];
        const fromLibrary = mapSermonDocsToItems(historyDocs);
        if (fromLibrary.length > 0) {
            return fromLibrary;
        }

        const fallbackRows =
            discovery.popularRecentlyPlayed.length > 0
                ? discovery.popularRecentlyPlayed
                : discovery.mostPlayed;
        return rowsToSermonItems(fallbackRows);
    }, [discovery, libraryQuery.data, rail]);

    const title = useMemo(() => {
        switch (rail) {
            case 'forYou':
                return 'Sermons for you';
            case 'top':
                return 'Top sermons';
            case 'minister':
                return discovery.featuredMinister
                    ? `Sermons from ${discovery.featuredMinister.name}`
                    : 'More from minister';
            case 'recentlyPlayed':
                return 'Recently played';
            default:
                return 'Sermons';
        }
    }, [discovery.featuredMinister, rail]);

    const isLoading =
        discovery.isLoading ||
        (rail === 'recentlyPlayed' &&
            libraryQuery.isLoading &&
            items.length === 0);

    return {
        items,
        title,
        isLoading,
        isError: !!discovery.error,
        refetch: () => {
            void discovery.refetch();
            if (rail === 'recentlyPlayed') {
                void libraryQuery.refetch();
            }
        },
    };
}
