import type { SermonDTO } from '../sermon/sermon.dto';

export type RailId =
    | 'sermons_for_you'
    | 'more_from_minister'
    | 'series_from_minister'
    | 'trending_playlists'
    | 'trending_sermons'
    | 'recently_added'
    | 'popular_ministers';

export interface DiscoveryRailDTO<T = unknown> {
    id: RailId;
    title: string;
    items: T[];
    pagination?: { hasMore: boolean; nextSkip?: number };
}

export interface DiscoveryHomeDTO {
    audienceMode: 'new' | 'returning';
    rails: DiscoveryRailDTO[];
    featuredMinisterId?: string;
    [key: string]: unknown;
}

export interface MinisterCardDTO {
    id: string;
    name: string;
    avatar?: string;
    [key: string]: unknown;
}

export type SermonCardDTO = Pick<
    SermonDTO,
    'name' | 'description' | 'code'
> & {
    id: string;
    minister?: MinisterCardDTO;
    artworkUrl?: string;
    durationMs?: number;
};
