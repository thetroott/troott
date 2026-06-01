import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '../../api';
import {
    mapSermonDocsToItems,
    ministerDocToRow,
} from '@/engine/utils/library-map';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import { queryKeys } from '../../query-keys';
import { queryClient } from '@/api/services/query-client';
import {
    canonicalSearchQuery,
    normalizeSearchQuery,
    SEARCH_MIN_QUERY_LENGTH,
} from '@/constants/search-ui';
import { mmkvStateStorage } from '@/api/services/mmkv-storage';

const KEY_LEGACY_PREFIX = 'library_recent_search_queries_v1:';
const KEY_ENTRIES_PREFIX = 'library_recent_search_entries_v2:';
export const SEARCH_HISTORY_MAX_ITEMS = 18;
export const SEARCH_HISTORY_FALLBACK_USER_ID = '__troott_local_search__';

let historyIdSeq = 0;

export type SearchHistoryType =
    | 'sermon'
    | 'minister'
    | 'playlist'
    | 'generic';

export type SearchHistoryEntry = {
    id: string;
    query: string;
    type: SearchHistoryType;
    timestamp: number;
    useCount: number;
};

export type CatalogSearchMinisterHit = {
    id: string;
    name: string;
    image?: string;
};

export type CatalogSearchResult = {
    sermons: SermonItemDTO[];
    ministers: CatalogSearchMinisterHit[];
};

function newSearchHistoryEntryId(): string {
    historyIdSeq += 1;
    return `srch_${Date.now().toString(36)}_${historyIdSeq.toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function compareHistoryRank(
    a: SearchHistoryEntry,
    b: SearchHistoryEntry,
): number {
    const ua = a.useCount;
    const ub = b.useCount;
    if (ub !== ua) return ub - ua;
    return b.timestamp - a.timestamp;
}

function keyLegacy(userId: string): string {
    return `${KEY_LEGACY_PREFIX}${userId}`;
}

function keyEntries(userId: string): string {
    return `${KEY_ENTRIES_PREFIX}${userId}`;
}

function readStringSync(storageKey: string): string | null {
    const v = mmkvStateStorage.getItem(storageKey);
    if (typeof v === 'string') return v;
    return null;
}

function isSearchHistoryEntry(x: unknown): x is SearchHistoryEntry {
    if (x == null || typeof x !== 'object') return false;
    const o = x as Record<string, unknown>;
    const uc = o.useCount;
    if (
        uc !== undefined &&
        (typeof uc !== 'number' || !Number.isFinite(uc) || uc < 1)
    ) {
        return false;
    }
    return (
        typeof o.id === 'string' &&
        typeof o.query === 'string' &&
        typeof o.timestamp === 'number' &&
        typeof o.type === 'string' &&
        ['sermon', 'minister', 'playlist', 'generic'].includes(o.type)
    );
}

function withDefaultUseCount(e: SearchHistoryEntry): SearchHistoryEntry {
    const useCount =
        typeof e.useCount === 'number' && e.useCount >= 1 ? e.useCount : 1;
    return { ...e, useCount };
}

function sortAndCap(entries: SearchHistoryEntry[]): SearchHistoryEntry[] {
    return [...entries]
        .map(withDefaultUseCount)
        .sort(compareHistoryRank)
        .slice(0, SEARCH_HISTORY_MAX_ITEMS);
}

function migrateLegacyStrings(userId: string): SearchHistoryEntry[] | null {
    const raw = readStringSync(keyLegacy(userId));
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return null;
        const strings = parsed
            .filter((x): x is string => typeof x === 'string')
            .map((s) => s.trim())
            .filter(Boolean);
        if (strings.length === 0) return [];
        const base = Date.now();
        return strings.map((query, index) => ({
            id: newSearchHistoryEntryId(),
            query,
            type: 'generic' as const,
            timestamp: base - index,
            useCount: 1,
        }));
    } catch {
        return null;
    }
}

function writeEntries(userId: string, entries: SearchHistoryEntry[]): void {
    mmkvStateStorage.setItem(keyEntries(userId), JSON.stringify(entries));
}

function getLibraryRecentSearchEntries(userId: string): SearchHistoryEntry[] {
    const rawV2 = readStringSync(keyEntries(userId));
    if (rawV2) {
        try {
            const parsed = JSON.parse(rawV2) as unknown;
            if (Array.isArray(parsed)) {
                const out: SearchHistoryEntry[] = [];
                for (const item of parsed) {
                    if (!isSearchHistoryEntry(item)) continue;
                    out.push(withDefaultUseCount(item));
                }
                const sorted = sortAndCap(out);
                const ids = (xs: SearchHistoryEntry[]) =>
                    xs.map((x) => x.id).join(',');
                const useCountBackfill = out.some(
                    (p) =>
                        p.useCount == null || typeof p.useCount !== 'number',
                );
                if (
                    ids(sorted) !== ids(out) ||
                    useCountBackfill ||
                    sorted.length !== out.length
                ) {
                    writeEntries(userId, sorted);
                }
                return sorted;
            }
        } catch {
            /* fall through */
        }
    }

    const migrated = migrateLegacyStrings(userId);
    if (migrated != null) {
        const capped = sortAndCap(migrated);
        writeEntries(userId, capped);
        mmkvStateStorage.removeItem(keyLegacy(userId));
        return capped;
    }

    return [];
}

function addLibraryRecentSearchEntry(
    userId: string,
    term: string,
    type: SearchHistoryType = 'generic',
): void {
    const t = term.trim();
    if (!t) return;

    const prev = getLibraryRecentSearchEntries(userId);
    const norm = normalizeSearchQuery(t);
    const idx = prev.findIndex(
        (e) => normalizeSearchQuery(e.query) === norm,
    );

    let next: SearchHistoryEntry[];
    if (idx >= 0) {
        const existing = prev[idx];
        const prevCount =
            typeof existing.useCount === 'number' && existing.useCount >= 1
                ? existing.useCount
                : 1;
        const updated: SearchHistoryEntry = {
            ...existing,
            query: t,
            timestamp: Date.now(),
            type: type !== 'generic' ? type : existing.type,
            useCount: prevCount + 1,
        };
        next = [...prev.filter((_, i) => i !== idx), updated];
    } else {
        next = [
            ...prev,
            {
                id: newSearchHistoryEntryId(),
                query: t,
                type,
                timestamp: Date.now(),
                useCount: 1,
            },
        ];
    }

    writeEntries(userId, sortAndCap(next));
}

function removeLibraryRecentSearchEntry(
    userId: string,
    entryId: string,
): void {
    const prev = getLibraryRecentSearchEntries(userId);
    const next = prev.filter((e) => e.id !== entryId);
    if (next.length === 0) {
        mmkvStateStorage.removeItem(keyEntries(userId));
    } else {
        writeEntries(userId, next);
    }
}

function filterRecentEntriesByPrefix(
    items: SearchHistoryEntry[],
    prefix: string,
): SearchHistoryEntry[] {
    const p = prefix.trim().toLowerCase();
    if (!p) return items;
    return items.filter((item) =>
        item.query.toLowerCase().startsWith(p),
    );
}

function clearLibraryRecentSearches(userId: string): void {
    mmkvStateStorage.removeItem(keyLegacy(userId));
    mmkvStateStorage.removeItem(keyEntries(userId));
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
            typeof q.queryKey[2] === 'string',
    });

    let best: { len: number; data: CatalogSearchResult } | undefined;

    for (const q of queries) {
        const k = q.queryKey[2] as string;
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
            const data = (res.data ?? {}) as {
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

export function useMinisterPickerSearchQuery(q: string, enabled = true) {
    const trimmed = q.trim();
    return useQuery({
        queryKey: queryKeys.search.ministers(trimmed),
        queryFn: async () => {
            const res = await api.search.searchMinisters({
                q: trimmed,
                limit: 20,
            });
            if (res.error) {
                throw new Error(res.message || 'Search failed');
            }
            const docs = Array.isArray(res.data) ? res.data : [];
            const out: CatalogSearchMinisterHit[] = [];
            for (const doc of docs) {
                const row = ministerDocToRow(doc);
                if (row) {
                    out.push(row);
                }
            }
            return out;
        },
        enabled: enabled && trimmed.length >= 2,
    });
}

export function useSeriesPickerSearchQuery(q: string, enabled = true) {
    const trimmed = q.trim();
    return useQuery({
        queryKey: queryKeys.search.series(trimmed),
        queryFn: async () => {
            const res = await api.search.searchSeries({
                q: trimmed,
                limit: 20,
            });
            if (res.error) {
                throw new Error(res.message || 'Search failed');
            }
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: enabled && trimmed.length >= 2,
    });
}
