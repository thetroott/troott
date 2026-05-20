import {
    SET_IS_FIRST_TIME_USER,
    SET_LOADER,
    SET_LOADING,
    UNSET_LOADING,
} from '../types';
import type { AppAction, AppReducerState } from './types';

const appReducer = (
    state: AppReducerState,
    action: AppAction,
): AppReducerState => {
    switch (action.type) {
        case SET_IS_FIRST_TIME_USER:
            return { ...state, isFirstTimeUser: action.payload };
        case SET_LOADING:
            return { ...state, loading: true };
        case SET_LOADER:
            return { ...state, loader: action.payload };
        case UNSET_LOADING:
            return {
                ...state,
                loading: false,
                loader: false,
                message: action.payload ?? state.message,
            };
        default:
            return state;
    }
};

export default appReducer;
