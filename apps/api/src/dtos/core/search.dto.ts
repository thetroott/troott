export interface SermonSearchCard {
    id: string;
    title: string;
    imageUrl?: string;
    duration?: number;
    ministerName?: string;
    seriesTitle?: string;
    slug?: string;
    preachedAt?: string;
}

export interface SeriesSearchCard {
    id: string;
    title: string;
    imageUrl?: string;
    sermonCount?: number;
    ministerName?: string;
    slug?: string;
}

export interface MinisterSearchCard {
    id: string;
    firstName: string;
    lastName: string;
    ministerialName?: string;
    avatar?: string;
    slug?: string;
}

export interface PlaylistSearchCard {
    id: string;
    title: string;
    banner?: string;
    itemsCount: number;
    ownerName?: string;
    slug?: string;
}

export interface TopicSearchCard {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    usageCount: number;
}

export interface SearchResultDTO {
    sermons: SermonSearchCard[];
    series: SeriesSearchCard[];
    ministers: MinisterSearchCard[];
    playlists: PlaylistSearchCard[];
    topics: TopicSearchCard[];
    totalCount: number;
}

export interface SearchSuggestionDTO {
    suggestions: string[];
}

export interface RecentSearchDTO {
    id: string;
    query: string;
    searchedAt: string;
}

export interface TrendingSearchDTO {
    term: string;
    count: number;
}

export interface SearchQueryOptions {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    from?: string;
    to?: string;
}

export type SearchScope =
    | 'all'
    | 'sermon'
    | 'series'
    | 'minister'
    | 'playlist'
    | 'topic';
