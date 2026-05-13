import { useCallback, useMemo, useState } from 'react';

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
