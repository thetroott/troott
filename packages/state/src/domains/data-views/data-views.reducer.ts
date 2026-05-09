import {
    GET_CREATOR,
    GET_CREATORS,
    GET_DISCOVERY_HOME,
    GET_FEATURED_MINISTER,
    GET_LIBRARY,
    GET_LISTENER,
    GET_LISTENERS,
    GET_MINISTER,
    GET_MINISTERS,
    GET_PLAN,
    GET_PLANS,
    GET_PLAYLIST,
    GET_PLAYLISTS,
    GET_SEARCH_RESULTS,
    GET_SERMON,
    GET_SERMONS,
    GET_TRANSACTION,
    GET_TRANSACTIONS,
    GET_USERS,
    SET_LOADING,
    UNSET_LOADING,
} from '../../helpers/types';
import type { ICollection } from '../../helpers/interface';
import type { DataViewsAction, DataViewsState } from './data-views.types';

export function dataViewsReducer(
    state: DataViewsState,
    action: DataViewsAction,
): DataViewsState {
    switch (action.type) {
        case GET_USERS:
            return { ...state, users: action.payload as ICollection };
        case GET_SERMONS:
            return { ...state, sermons: action.payload as ICollection };
        case GET_SERMON:
            return { ...state, sermon: action.payload };
        case GET_PLAYLISTS:
            return { ...state, playlists: action.payload as ICollection };
        case GET_PLAYLIST:
            return { ...state, playlist: action.payload };
        case GET_MINISTERS:
            return { ...state, ministers: action.payload as ICollection };
        case GET_MINISTER:
            return { ...state, minister: action.payload };
        case GET_LISTENERS:
            return { ...state, listeners: action.payload as ICollection };
        case GET_LISTENER:
            return { ...state, listener: action.payload };
        case GET_CREATORS:
            return { ...state, creators: action.payload as ICollection };
        case GET_CREATOR:
            return { ...state, creator: action.payload };
        case GET_LIBRARY:
            return { ...state, library: action.payload };
        case GET_DISCOVERY_HOME:
            return { ...state, discoveryHome: action.payload };
        case GET_FEATURED_MINISTER:
            return { ...state, featuredMinister: action.payload };
        case GET_SEARCH_RESULTS:
            return { ...state, searchResults: action.payload as ICollection };
        case GET_PLANS:
            return { ...state, plans: action.payload as ICollection };
        case GET_PLAN:
            return { ...state, plan: action.payload };
        case GET_TRANSACTIONS:
            return { ...state, transactions: action.payload as ICollection };
        case GET_TRANSACTION:
            return { ...state, transaction: action.payload };
        case SET_LOADING:
            return { ...state, loading: true };
        case UNSET_LOADING:
            return {
                ...state,
                loading: false,
            };
        default:
            return state;
    }
}
