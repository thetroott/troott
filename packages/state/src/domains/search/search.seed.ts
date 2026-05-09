import type { SearchState } from './search.types';

export const searchInitial: SearchState = {
    recentSearches: [],
    currentQuery: null,
    currentResultsRef: null,
    isSearching: false,
};
