import { useCallback, useMemo, useReducer, type ReactNode } from 'react';

import sidebarRoutes from '@/routes/routes/sidebar.route';
import type { IRoute } from '@/utils/interfaces';
import type {
    ICollection,
    ISetLoading,
    ISidebarProps,
    IUnsetLoading,
} from '@/utils/interfaces.util';

import UserContext from './userContext';
import userReducer from './userReducer';
import {
    SET_BUSINESS_TYPE,
    SET_LOADER,
    SET_LOADING,
    SET_SIDEBAR,
    SET_TOAST,
    SET_USERTYPE,
    UNSET_LOADING,
} from '../types';
import type { IUserContextValue, UserAction, UserReducerState } from './types';

const emptyCollection = (): ICollection => ({
    data: [],
    count: 0,
    total: 0,
    pagination: {
        next: { page: 1, limit: 25 },
        prev: { page: 1, limit: 25 },
    },
    loading: false,
    message: 'There are no data currently',
});

const initialSidebar = (): ISidebarProps => {
    const root = sidebarRoutes[0] as IRoute;
    return {
        collapsed: false,
        route: root,
        inroutes: root.inroutes ?? [],
        subroutes: root.subroutes ?? [],
        isOpen: false,
    };
};

const buildInitialUserState = (): UserReducerState => ({
    audits: undefined,
    users: emptyCollection(),
    admins: undefined,
    user: null,
    userDetails: undefined,
    userType: '',
    businessType: '',
    talents: emptyCollection(),
    talent: null,
    items: [],
    sidebar: initialSidebar(),
    toast: {},
    isSuper: false,
    isAdmin: false,
    count: 0,
    total: 0,
    pagination: {},
    search: emptyCollection(),
    response: undefined,
    loading: false,
    loader: false,
    message: '',
});

const UserState = (props: { children: ReactNode }) => {
    const initialState = buildInitialUserState();
    const [state, dispatch] = useReducer(userReducer, initialState);

    const setUserType = useCallback((type: string) => {
        dispatch({ type: SET_USERTYPE, payload: type });
    }, []);

    const setBusinessType = useCallback((type: string) => {
        dispatch({ type: SET_BUSINESS_TYPE, payload: type });
    }, []);

    const setSidebar = useCallback((data: ISidebarProps) => {
        dispatch({ type: SET_SIDEBAR, payload: data });
    }, []);

    const currentSidebar = useCallback(
        (collapse: boolean): ISidebarProps | null => {
            if (!state.sidebar?.route) {
                return null;
            }
            return { ...state.sidebar, collapsed: collapse };
        },
        [state.sidebar],
    );

    const setToast = useCallback((data: Record<string, unknown>) => {
        dispatch({ type: SET_TOAST, payload: data });
    }, []);

    const clearToast = useCallback(() => {
        dispatch({ type: SET_TOAST, payload: {} });
    }, []);

    const setCollection = useCallback((type: string, data: ICollection) => {
        dispatch({ type, payload: data } as UserAction);
    }, []);

    const setResource = useCallback((type: string, data: unknown) => {
        dispatch({ type, payload: data } as UserAction);
    }, []);

    const setLoading = useCallback(async (data: ISetLoading) => {
        if (data.option === 'default') {
            dispatch({ type: SET_LOADING });
        }
        if (data.option === 'loader') {
            dispatch({ type: SET_LOADER, payload: true });
        }
        if (data.option === 'resource' && data.type) {
            const { loading: _loading, ...rest } = emptyCollection();
            dispatch({
                type: data.type,
                payload: { ...rest, loading: true },
            } as UserAction);
        }
    }, []);

    const unsetLoading = useCallback(async (data: IUnsetLoading) => {
        if (data.option === 'default') {
            dispatch({ type: UNSET_LOADING, payload: data.message });
        }
        if (data.option === 'loader') {
            dispatch({ type: SET_LOADER, payload: false });
        }
        if (data.option === 'resource' && data.type) {
            const { loading: _loading, message: _message, ...rest } =
                emptyCollection();
            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: false,
                    message: data.message,
                },
            } as UserAction);
        }
    }, []);

    const contextValue: IUserContextValue = useMemo(
        () => ({
            ...state,
            setUserType,
            setBusinessType,
            setSidebar,
            currentSidebar,
            setToast,
            clearToast,
            setCollection,
            setResource,
            setLoading,
            unsetLoading,
        }),
        [
            state,
            setUserType,
            setBusinessType,
            setSidebar,
            currentSidebar,
            setToast,
            clearToast,
            setCollection,
            setResource,
            setLoading,
            unsetLoading,
        ],
    );

    return (
        <UserContext.Provider value={contextValue}>
            {props.children}
        </UserContext.Provider>
    );
};

export default UserState;
