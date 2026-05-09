import type { ICollection } from '../../helpers/interface';

/** Legacy list + resource cache (GET_*), split from future normalized `entities`. */
export interface DataViewsState {
    users: ICollection;
    sermons: ICollection;
    sermon: unknown;
    playlists: ICollection;
    playlist: unknown;
    ministers: ICollection;
    minister: unknown;
    listeners: ICollection;
    listener: unknown;
    creators: ICollection;
    creator: unknown;
    library: unknown;
    discoveryHome: unknown;
    featuredMinister: unknown;
    searchResults: ICollection;
    plans: ICollection;
    plan: unknown;
    transactions: ICollection;
    transaction: unknown;
    loading: boolean;
}

export type DataViewsAction = { type: string; payload?: unknown };
