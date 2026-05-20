import { getMMKV } from '@/api/services/mmkv-storage';
import {
    useCallback,
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

const initialState = {
    isFirstTimeUser: true,
    loading: false,
    loader: false,
    message: '',
};

export function AppState({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const setFirstTimeUser = useCallback((value: boolean) => {
        dispatch({ type: SET_IS_FIRST_TIME_USER, payload: value });
        if (!value) {
            getMMKV().set(FIRST_TIME_KEY, 'true');
        }
    }, []);

    const setLoading = useCallback(() => {
        dispatch({ type: SET_LOADING });
    }, []);

    const unsetLoading = useCallback((message?: string) => {
        dispatch({ type: UNSET_LOADING, payload: message });
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
