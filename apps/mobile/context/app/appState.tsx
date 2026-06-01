import { getMMKV } from '@/api/services/mmkv-storage';
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    type ReactNode,
} from 'react';

import AppContext from './appContext';
import appReducer from './appReducer';
import {
    SET_IS_FIRST_TIME_USER,
    SET_LOADER,
    SET_LOADING,
    UNSET_LOADING,
} from '../types';
import type { IAppContextValue } from './types';

const FIRST_TIME_KEY = 'isFirstTime';

function readIsFirstTimeUser(): boolean {
    return getMMKV().getString(FIRST_TIME_KEY) !== 'true';
}

const buildInitialState = () => ({
    isFirstTimeUser: readIsFirstTimeUser(),
    loading: false,
    loader: false,
    message: '',
});

export function AppState({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState);

    useEffect(() => {
        dispatch({
            type: SET_IS_FIRST_TIME_USER,
            payload: readIsFirstTimeUser(),
        });
    }, []);

    const setFirstTimeUser = useCallback((value: boolean) => {
        dispatch({ type: SET_IS_FIRST_TIME_USER, payload: value });
        if (!value) {
            getMMKV().set(FIRST_TIME_KEY, 'true');
        }
    }, []);

    const setLoading = useCallback((option: 'default' | 'loader' = 'default') => {
        if (option === 'loader') {
            dispatch({ type: SET_LOADER, payload: true });
        } else {
            dispatch({ type: SET_LOADING });
        }
    }, []);

    const unsetLoading = useCallback((message?: string) => {
        dispatch({ type: UNSET_LOADING, payload: message });
        dispatch({ type: SET_LOADER, payload: false });
    }, []);

    const value = useMemo<IAppContextValue>(
        () => ({
            ...state,
            setFirstTimeUser,
            setLoading,
            unsetLoading,
        }),
        [state, setFirstTimeUser, setLoading, unsetLoading],
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): IAppContextValue {
    const ctx = useContext(AppContext);
    if (!ctx) {
        throw new Error(
            'useAppContext must be used within TroottProviders (AppState)',
        );
    }
    return ctx;
}
