import { useMemo } from 'react';
import { useDiscoveryHomeQuery } from '@/api/hooks/app/useDiscovery';
import {
    mapSermonDocsToItems,
    sermonDocToCatalogRow,
} from '@/engine/utils/library-map';
import type { ISermonTrack } from '@/types/sermon';

function collectSermonDocs(home: unknown): unknown[] {
    if (!home || typeof home !== 'object') {
        return [];
    }
    const root = home as Record<string, unknown>;
    const rails = root.rails ?? root.sections ?? root;
    if (!Array.isArray(rails)) {
        const direct = root.sermons ?? root.items;
        return Array.isArray(direct) ? direct : [];
    }
    const docs: unknown[] = [];
    for (const rail of rails) {
        if (!rail || typeof rail !== 'object') continue;
        const items = (rail as Record<string, unknown>).items;
        if (Array.isArray(items)) {
            docs.push(...items);
        }
    }
    return docs;
}

export const SERMONS_QUERY_KEY = ['discovery', 'home', 'catalog'] as const;

export function useSermonsCatalog() {
    const query = useDiscoveryHomeQuery();

    const data = useMemo((): ISermonTrack[] | undefined => {
        if (!query.data) {
            return undefined;
        }
        const docs = collectSermonDocs(query.data);
        const tracks: ISermonTrack[] = [];
        for (const doc of docs) {
            const row = sermonDocToCatalogRow(doc);
            if (row?.id) {
                tracks.push(row as ISermonTrack);
            }
        }
        if (tracks.length > 0) {
            return tracks;
        }
        return mapSermonDocsToItems(docs) as unknown as ISermonTrack[];
    }, [query.data]);

    return {
        data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
