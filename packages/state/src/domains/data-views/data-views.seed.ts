import { collection } from '../../helpers/seed';
import type { DataViewsState } from './data-views.types';

export const dataViewsInitial: DataViewsState = {
    users: collection,
    sermons: collection,
    sermon: {},
    playlists: collection,
    playlist: {},
    ministers: collection,
    minister: {},
    listeners: collection,
    listener: {},
    creators: collection,
    creator: {},
    library: {},
    discoveryHome: null,
    featuredMinister: null,
    searchResults: collection,
    plans: collection,
    plan: {},
    transactions: collection,
    transaction: {},
    loading: false,
};
