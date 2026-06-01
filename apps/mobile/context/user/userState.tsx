import {
    useCallback,
    useContext,
    useMemo,
    useReducer,
    type ReactNode,
} from 'react';

import UserContext from './userContext';
import userReducer from './userReducer';
import {
    GET_LISTENER,
    GET_LOGGEDIN_USER,
    SET_LISTENER,
    SET_LISTENER_ONBOARDING,
    SET_LOADER,
    SET_LOADING,
    SET_USER,
    SET_USERTYPE,
    UNSET_LOADING,
} from '../types';
import type { IUserContextValue, ListenerProfile, SessionUser } from './types';

const initialState = {
    user: null as SessionUser,
    userType: '',
    listener: null as ListenerProfile,
    loading: false,
    loader: false,
    message: '',
};

export function UserState({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(userReducer, initialState);

    const setUser = useCallback((user: SessionUser) => {
        dispatch({ type: SET_USER, payload: user });
    }, []);

    const setUserType = useCallback((type: string) => {
        dispatch({ type: SET_USERTYPE, payload: type });
    }, []);

    const setListener = useCallback((listener: ListenerProfile) => {
        dispatch({ type: SET_LISTENER, payload: listener });
    }, []);

    const setResource = useCallback((type: string, data: unknown) => {
        dispatch({ type, payload: data } as never);
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

    const value = useMemo<IUserContextValue>(
        () => ({
            ...state,
            setUser,
            setUserType,
            setListener,
            setResource,
            setLoading,
            unsetLoading,
        }),
        [
            state,
            setUser,
            setUserType,
            setListener,
            setResource,
            setLoading,
            unsetLoading,
        ],
    );

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
}

export function useUserContext(): IUserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error(
            'useUserContext must be used within TroottProviders (UserState)',
        );
    }
    return ctx;
}

export {
    GET_LISTENER,
    GET_LOGGEDIN_USER,
    SET_LISTENER_ONBOARDING,
};
