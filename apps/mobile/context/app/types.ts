import type { SET_IS_FIRST_TIME_USER, SET_LOADER, SET_LOADING, UNSET_LOADING } from '../types';

export interface AppReducerState {
    isFirstTimeUser: boolean;
    loading: boolean;
    loader: boolean;
    message: string;
}

export type AppAction =
    | { type: typeof SET_IS_FIRST_TIME_USER; payload: boolean }
    | { type: typeof SET_LOADING }
    | { type: typeof SET_LOADER; payload: boolean }
    | { type: typeof UNSET_LOADING; payload?: string };

export interface IAppContextValue extends AppReducerState {
    setFirstTimeUser(value: boolean): void;
    setLoading(): void;
    unsetLoading(message?: string): void;
}
