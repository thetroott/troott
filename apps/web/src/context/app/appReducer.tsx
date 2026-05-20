import { SET_LOADING, SET_LOADER, SET_SEARCH, UNSET_LOADING } from '../types';
import type { AppReducerState } from './types';

type AppAction = { type: string; payload?: unknown };

const AppReducer = (state: AppReducerState, action: AppAction): AppReducerState => {
    switch (action.type) {
        case SET_SEARCH:
            return {
                ...state,
                search: action.payload as AppReducerState['search'],
            };
        case SET_LOADING:
            return {
                ...state,
                loading: true,
            };
        case SET_LOADER:
            return {
                ...state,
                loader: action.payload as boolean,
            };
        case UNSET_LOADING:
            return {
                ...state,
                loading: false,
                message: action.payload as string,
            };
        default:
            return state;
    }
};

export default AppReducer;
