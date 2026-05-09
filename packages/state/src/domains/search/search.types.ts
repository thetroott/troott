export interface SearchState {
    recentSearches: Array<{
        query: string;
        type: string;
        timestamp: number;
        useCount: number;
    }>;
    currentQuery: string | null;
    currentResultsRef: unknown;
    isSearching: boolean;
}

export type SearchAction = { type: string; payload?: unknown };
