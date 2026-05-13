import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    normalizeSearchQuery,
    SEARCH_DEBOUNCE_MS,
    SEARCH_MIN_QUERY_LENGTH,
} from '@/constants/search-ui';

/**
 * Spotify-style execution model: the network + results use a committed term that updates
 * after the user pauses (debounce) or explicitly submits — not on every keystroke.
 */
export function useCommittedSearchTerm(query: string) {
    const normalizedLive = useMemo(() => normalizeSearchQuery(query), [query]);
    const [committedSearch, setCommittedSearch] = useState('');

    useEffect(() => {
        if (normalizedLive.length === 0) {
            setCommittedSearch('');
            return;
        }
        const t = setTimeout(() => {
            setCommittedSearch(
                normalizedLive.length >= SEARCH_MIN_QUERY_LENGTH
                    ? normalizedLive
                    : '',
            );
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [normalizedLive]);

    /**
     * Run search immediately (keyboard search button). Pass `raw` when the field
     * text is about to update in the same frame (e.g. tapping a recent suggestion).
     */
    const flushCommittedSearch = useCallback(
        (raw?: string) => {
            const n =
                raw !== undefined
                    ? normalizeSearchQuery(raw)
                    : normalizedLive;
            if (n.length === 0) {
                setCommittedSearch('');
                return;
            }
            setCommittedSearch(
                n.length >= SEARCH_MIN_QUERY_LENGTH ? n : '',
            );
        },
        [normalizedLive],
    );

    /** Live text qualifies for search but debounce has not applied yet. */
    const isCommitPending =
        normalizedLive.length >= SEARCH_MIN_QUERY_LENGTH &&
        normalizedLive !== committedSearch;

    /** Safe to treat UI as showing the outcome of `committedSearch` (no in-flight debounce gap). */
    const isCommittedSynced = normalizedLive === committedSearch;

    return {
        normalizedLive,
        committedSearch,
        flushCommittedSearch,
        isCommitPending,
        isCommittedSynced,
    };
}
