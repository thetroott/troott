import { useQuery } from '@tanstack/react-query';

import axiosService from '@/api/core/axios';
import {
    mapSermonDocsToItems,
    ministerDocToRow,
} from '@/engine/utils/library-map';
import type { SermonItemDTO } from '@/types/sermon';
import { QueryKeys } from '@/utils/enums.util';
import { queryClient } from '@/services/query-client';
import {
    canonicalSearchQuery,
    SEARCH_MIN_QUERY_LENGTH,
} from '@/constants/search-ui';

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
            q.queryKey[0] === QueryKeys.CatalogSearch &&
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
 * - `signal` passes through to Axios for cancellation on unmount / key change.
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

    // Query key is `[CatalogSearch, canonical]` — add locale/region when API is locale-aware.
    return useQuery({
        queryKey: [QueryKeys.CatalogSearch, canonical],
        queryFn: async ({ signal }): Promise<CatalogSearchResult> => {
            const raw = await axiosService.call({
                method: 'GET',
                type: 'default',
                path: `/search?q=${encodeURIComponent(canonical)}&scope=all`,
                isAuth: false,
                signal,
            });
            const data = parseApiData(raw) as {
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
        /** Bounded retention for search payloads vs global ONE_DAY — pairs with persisted cache `maxAge`. */
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
    });
}
