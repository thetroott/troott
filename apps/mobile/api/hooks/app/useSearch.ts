import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '../../api';
import {
    mapSermonDocsToItems,
    ministerDocToRow,
} from '@/engine/utils/library-map';
import type { SermonItemDTO } from '@/types/sermon';
import { queryKeys } from '../../utils/query-keys';
import { queryClient } from '@/api/services/query-client';
import {
    canonicalSearchQuery,
    SEARCH_MIN_QUERY_LENGTH,
} from '@/constants/search-ui';
import type { IAPIResponse } from '@/utils/interface.utl';
import {
    addLibraryRecentSearchEntry,
    clearLibraryRecentSearches,
    filterRecentEntriesByPrefix,
    getLibraryRecentSearchEntries,
    removeLibraryRecentSearchEntry,
    SEARCH_HISTORY_FALLBACK_USER_ID,
    type SearchHistoryEntry,
    type SearchHistoryType,
} from '@/lib/library-recent-search-storage';

export type { SearchHistoryEntry, SearchHistoryType };

export type CatalogSearchMinisterHit = {
    id: string;
    name: string;
    image?: string;
};

export type CatalogSearchResult = {
    sermons: SermonItemDTO[];
    ministers: CatalogSearchMinisterHit[];
};

function parseApiData(raw: unknown): unknown {
    const r = raw as { error?: boolean; message?: string; data?: unknown };
    if (r && typeof r === 'object' && r.error) {
        throw new Error(r.message || 'Request failed');
    }
    if (r && typeof r === 'object' && 'data' in r && r.data !== undefined) {
        return r.data;
    }
    return raw;
}

/**
 * Best cached result whose canonical key is a strict prefix of `canonical`
 * (seeds longer queries while the network request runs).
 */
function pickPrefixPlaceholder(
    canonical: string,
): CatalogSearchResult | undefined {
    if (canonical.length < SEARCH_MIN_QUERY_LENGTH) return undefined;

    const queries = queryClient.getQueryCache().findAll({
        predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === 'search' &&
            q.queryKey[1] === 'catalog' &&
            typeof q.queryKey[1] === 'string',
    });

    let best: { len: number; data: CatalogSearchResult } | undefined;

    for (const q of queries) {
        const k = q.queryKey[1] as string;
        if (k === canonical) continue;
        if (canonical.startsWith(k) && k.length < canonical.length) {
            const d = q.state.data as CatalogSearchResult | undefined;
            if (d && (!best || k.length > best.len)) {
                best = { len: k.length, data: d };
            }
        }
    }

    return best?.data;
}

/**
 * Spotify-style catalog search:
 * - Query key uses {@link canonicalSearchQuery} only so spacing/punctuation variants dedupe.
 * - Identical in-flight requests dedupe automatically (TanStack Query).
 * - `signal` passes through to `fetch` for cancellation on unmount / key change.
 * - `placeholderData` keeps prior rows and can seed from the longest cached prefix key.
 * - Shorter `gcTime` than the global client default — see memory policy in query-client.
 */
export function useCatalogSearchQuery(q: string, enabled: boolean) {
    const trimmed = q.trim();
    const canonical =
        trimmed.length > 0 ? canonicalSearchQuery(trimmed) : '';

    const queryEnabled =
        enabled &&
        trimmed.length > 0 &&
        canonical.length >= SEARCH_MIN_QUERY_LENGTH;

    return useQuery({
        queryKey: queryKeys.search.catalog(canonical),
        queryFn: async (): Promise<CatalogSearchResult> => {
            const res = await api.search.searchCatalog({
                q: canonical,
                scope: 'all',
            });
            if (res.error) {
                throw new Error(res.message || 'Search failed');
            }
            const data = parseApiData(res) as {
                sermons?: unknown;
                ministers?: unknown;
            };

            const sermonDocs = Array.isArray(data?.sermons)
                ? data.sermons
                : [];
            const ministerDocs = Array.isArray(data?.ministers)
                ? data.ministers
                : [];

            const ministers: CatalogSearchMinisterHit[] = [];
            for (const doc of ministerDocs) {
                const row = ministerDocToRow(doc);
                if (row) ministers.push(row);
            }

            return {
                sermons: mapSermonDocsToItems(sermonDocs),
                ministers,
            };
        },
        enabled: queryEnabled,
        placeholderData: (previousData) =>
            previousData ?? pickPrefixPlaceholder(canonical),
        staleTime: 60_000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    });
}

function resolveHistoryStorageKey(userId: string | undefined): string {
    if (userId != null && String(userId).trim().length > 0) {
        return String(userId);
    }
    return SEARCH_HISTORY_FALLBACK_USER_ID;
}

/**
 * Spotify-like local search history: synchronous MMKV reads + epoch for instant UI after mutations.
 */
export function useSearchHistory(userId: string | undefined) {
    const storageUserKey = resolveHistoryStorageKey(userId);

    const [epoch, setEpoch] = useState(0);

    const bump = useCallback(() => {
        setEpoch((n) => n + 1);
    }, []);

    const entries = useMemo((): SearchHistoryEntry[] => {
        return getLibraryRecentSearchEntries(storageUserKey);
    }, [storageUserKey, epoch]);

    const addEntry = useCallback(
        (term: string, type: SearchHistoryType = 'generic') => {
            addLibraryRecentSearchEntry(storageUserKey, term, type);
            bump();
        },
        [storageUserKey, bump],
    );

    const removeEntry = useCallback(
        (entryId: string) => {
            removeLibraryRecentSearchEntry(storageUserKey, entryId);
            bump();
        },
        [storageUserKey, bump],
    );

    const clearAll = useCallback(() => {
        clearLibraryRecentSearches(storageUserKey);
        bump();
    }, [storageUserKey, bump]);

    const filteredByPrefix = useCallback(
        (prefix: string) => filterRecentEntriesByPrefix(entries, prefix),
        [entries],
    );

    return {
        entries,
        addEntry,
        removeEntry,
        clearAll,
        filteredByPrefix,
        bump,
    };
}
