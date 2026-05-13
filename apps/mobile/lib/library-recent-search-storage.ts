import { normalizeSearchQuery } from '@/constants/search-ui';
import { mmkvStateStorage } from '@/api/storage/mmkv-client';

const KEY_LEGACY_PREFIX = 'library_recent_search_queries_v1:';
const KEY_ENTRIES_PREFIX = 'library_recent_search_entries_v2:';
/** Plan: cap 10–20; align with Spotify-like history depth */
export const SEARCH_HISTORY_MAX_ITEMS = 18;

/** MMKV namespace when `user?.id` is missing — keeps recents for signed-out / incomplete profile sessions. */
export const SEARCH_HISTORY_FALLBACK_USER_ID = '__troott_local_search__';

let historyIdSeq = 0;

/** Avoid `uuid` → `crypto.getRandomValues` (missing under some Hermes / debugger setups). */
function newSearchHistoryEntryId(): string {
    historyIdSeq += 1;
    return `srch_${Date.now().toString(36)}_${historyIdSeq.toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export type SearchHistoryType =
    | 'sermon'
    | 'minister'
    | 'playlist'
    | 'generic';

export type SearchHistoryEntry = {
    id: string;
    query: string;
    type: SearchHistoryType;
    /** Last interaction time (ms since epoch). */
    timestamp: number;
    /** Selection frequency — higher ranks first when capped. */
    useCount: number;
};

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

function parseEntriesJson(raw: string): SearchHistoryEntry[] | null {
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return null;
        const out: SearchHistoryEntry[] = [];
        for (const item of parsed) {
            if (!isSearchHistoryEntry(item)) continue;
            out.push(withDefaultUseCount(item as SearchHistoryEntry));
        }
        return out;
    } catch {
        return null;
    }
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

/**
 * Most recent first. Migrates legacy string[] storage once per user.
 */
export function getLibraryRecentSearchEntries(userId: string): SearchHistoryEntry[] {
    const rawV2 = readStringSync(keyEntries(userId));
    if (rawV2) {
        const parsed = parseEntriesJson(rawV2);
        if (parsed) {
            const sorted = sortAndCap(parsed);
            const ids = (xs: SearchHistoryEntry[]) => xs.map((x) => x.id).join(',');
            const useCountBackfill = parsed.some(
                (p) =>
                    p.useCount == null || typeof p.useCount !== 'number',
            );
            if (
                ids(sorted) !== ids(parsed) ||
                useCountBackfill ||
                sorted.length !== parsed.length
            ) {
                writeEntries(userId, sorted);
            }
            return sorted;
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

export function addLibraryRecentSearchEntry(
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

export function removeLibraryRecentSearchEntry(
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

export function filterRecentEntriesByPrefix(
    items: SearchHistoryEntry[],
    prefix: string,
): SearchHistoryEntry[] {
    const p = prefix.trim().toLowerCase();
    if (!p) return items;
    return items.filter((item) =>
        item.query.toLowerCase().startsWith(p),
    );
}

export function clearLibraryRecentSearches(userId: string): void {
    mmkvStateStorage.removeItem(keyLegacy(userId));
    mmkvStateStorage.removeItem(keyEntries(userId));
}
