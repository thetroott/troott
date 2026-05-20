import { useReducer, useCallback, useMemo, type ReactNode } from 'react';

import type { ICollection, ISetLoading, IUnsetLoading } from '@/utils/interfaces.util';

import AppContext from './appContext';
import AppReducer from './appReducer';
import { SET_LOADER, SET_LOADING, SET_SEARCH, UNSET_LOADING } from '../types';
import type { IAppContext, IClearResource, AppReducerState } from './types';

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

const buildInitialState = (): AppReducerState => ({
    search: emptyCollection(),
    message: '',
    loading: false,
    loader: false,
});

const AppState = (props: { children: ReactNode }) => {
    const initialState = buildInitialState();

    const [state, dispatch] = useReducer(AppReducer, initialState);

    const setLoading = useCallback(async (data: ISetLoading) => {
        if (data.option === 'default') {
            dispatch({ type: SET_LOADING });
        }

        if (data.option === 'loader') {
            dispatch({
                type: SET_LOADER,
                payload: true,
            });
        }

        if (data.option === 'resource' && data.type === SET_SEARCH) {
            const { loading: _loading, ...rest } = emptyCollection();

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: true,
                },
            });
        }
    }, []);

    const unsetLoading = useCallback(async (data: IUnsetLoading) => {
        if (data.option === 'default') {
            dispatch({
                type: UNSET_LOADING,
                payload: data.message,
            });
        }

        if (data.option === 'loader') {
            dispatch({
                type: SET_LOADER,
                payload: false,
            });
        }

        if (data.option === 'resource' && data.type === SET_SEARCH) {
            const { loading: _loading, message: _message, ...rest } = emptyCollection();

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: false,
                    message: data.message,
                },
            });
        }
    }, []);

    const clearResource = useCallback((data: IClearResource) => {
        const payload: ICollection | Record<string, never> =
            data.resource === 'multiple' ? emptyCollection() : {};

        dispatch({
            type: data.type,
            payload: payload as ICollection,
        });
    }, []);

    const setCollection = useCallback((type: string, data: ICollection) => {
        dispatch({
            type,
            payload: data,
        });
    }, []);

    const setResource = useCallback((type: string, data: unknown) => {
        dispatch({
            type,
            payload: data,
        });
    }, []);

    const contextValues: IAppContext = useMemo(
        () => ({
            search: state.search,
            message: state.message,
            loading: state.loading,
            loader: state.loader,
            setLoading,
            unsetLoading,
            clearResource,
            setResource,
            setCollection,
        }),
        [
            state.search,
            state.message,
            state.loading,
            state.loader,
            setLoading,
            unsetLoading,
            clearResource,
            setCollection,
            setResource,
        ],
    );

    return <AppContext.Provider value={contextValues}>{props.children}</AppContext.Provider>;
};

export default AppState;
