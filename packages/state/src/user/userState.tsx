import React, { useMemo, useReducer } from 'react';

import UserContext from './userContext';
import UserReducer from './userReducer';

import {
    SET_USERTYPE,
    SET_LOADING,
    SET_SIDEBAR,
    SET_USER,
    SET_RESPONSE,
    SET_TOAST,
    UNSET_LOADING,
    SET_BUSINESSTYPE,
} from '../helpers/types';
import { collection, sidebar, toast } from '../helpers/seed';
import {
    ISetLoading,
    ISidebarProps,
    IToast,
    IUnsetLoading,
    IRouteItem,
} from '@/utils/interfaces';
import storage from '@/storage/local-storage';
import sidebarRoutes from '../../routes/sidebar.route';
import { ICollection } from '../helpers/interface';

const UserState = (props: any) => {
    const initialState = {
        users: collection,
        user: {},
        talent: {},
        businesses: collection,
        business: {},
        admins: collection,
        admin: {},
        workspaces: collection,
        workspace: {},
        subscription: {},
        plan: {},
        growth: {},
        userType: '',
        businessType: '',
        response: {},
        loading: false,
        toast: toast,
        sidebar: sidebar,
    };

    const [state, dispatch] = useReducer(UserReducer, initialState);

    /**
     * @name setLoading
     * @param data
     */
    const setLoading = async (data: ISetLoading) => {
        if (data.option === 'default') {
            dispatch({
                type: SET_LOADING,
            });
        }

        if (data.option === 'resource' && data.type) {
            const { loading, ...rest } = collection;

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: true,
                },
            });
        }
    };

    /**
     * @name unsetLoading
     * @param data
     */
    const unsetLoading = async (data: IUnsetLoading) => {
        if (data.option === 'default') {
            dispatch({
                type: UNSET_LOADING,
                payload: data.message,
            });
        }

        if (data.option === 'resource' && data.type) {
            const { loading, message, ...rest } = collection;

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: false,
                    message: data.message,
                },
            });
        }
    };

    /**
     * @name setUserType
     * @param type
     */
    const setUserType = (type: string) => {
        dispatch({
            type: SET_USERTYPE,
            payload: type,
        });
    };

    /**
     * @name setUserType
     * @param type
     */
    const setUser = (data: any) => {
        dispatch({
            type: SET_USER,
            payload: data,
        });
    };

    /**
     * @name setBusinessType
     * @param type - BusinessType string
     */
    const setBusinessType = (type: string) => {
        dispatch({
            type: SET_BUSINESSTYPE, // You'll need to add this action type
            payload: type,
        });
    };

    /**
     * @name setResponse
     * @param data
     */
    const setResponse = (data: any) => {
        dispatch({
            type: SET_RESPONSE,
            payload: data,
        });
    };

    const setSidebar = (data: ISidebarProps) => {
        dispatch({
            type: SET_SIDEBAR,
            payload: data,
        });
    };

    const currentSidebar = (collapse: boolean): ISidebarProps | null => {
        let result: ISidebarProps | null = null;

        const name = storage.fetch('route.name');
        const sub = storage.fetch('route.subroute');

        const route = sidebarRoutes.find((x) => x.name === name);

        if (route && route.subroutes && route.subroutes.length > 0) {
            const subroute = route.subroutes.find(
                (m: IRouteItem) => m.name === sub,
            );

            if (subroute) {
                result = {
                    collapsed: collapse,
                    route: route,
                    subroutes: route.subroutes,
                    inroutes: route.inroutes ? route.inroutes : [],
                    isOpen: true,
                };
            } else {
                result = {
                    collapsed: collapse,
                    route: route,
                    subroutes: route.subroutes,
                    inroutes: route.inroutes ? route.inroutes : [],
                    isOpen: true,
                };
            }
        } else if (route) {
            result = {
                collapsed: collapse,
                route: route,
                subroutes: route.subroutes ? route.subroutes : [],
                inroutes: route.inroutes ? route.inroutes : [],
                isOpen: false,
            };
        }

        return result;
    };

    const setToast = (data: IToast) => {
        dispatch({
            type: SET_TOAST,
            payload: data,
        });
    };

    const clearToast = () => {
        dispatch({
            type: SET_TOAST,
            payload: {
                type: 'success',
                show: false,
                message: '',
                title: 'Feedback',
                position: 'top-right',
            },
        });
    };

    const setCollection = (type: string, data: ICollection) => {
        dispatch({
            type: type,
            payload: data,
        });
    };

    const setResource = (type: string, data: any) => {
        dispatch({
            type: type,
            payload: data,
        });
    };

    const contextValues = useMemo(
        () => ({
            users: state.users,
            user: state.user,
            talent: state.talent,
            mainCareer: state.mainCareer,
            userType: state.userType,
            businessType: state.businessType,
            loading: state.loading,
            toast: state.toast,
            subscription: state.subscription,
            plan: state.plan,
            sidebar: state.sidebar,
            growth: state.growth,
            setUser: setUser,
            setResponse: setResponse,
            setToast: setToast,
            clearToast: clearToast,
            setUserType: setUserType,
            setBusinessType: setBusinessType,
            setSidebar: setSidebar,
            currentSidebar: currentSidebar,
            setCollection: setCollection,
            setResource: setResource,
            setLoading: setLoading,
            unsetLoading: unsetLoading,
        }),
        [
            state.users,
            state.user,
            state.talent,
            state.mainCareer,
            state.userType,
            state.businessType,
            state.loading,
            state.toast,
            state.subscription,
            state.plan,
            state.sidebar,
            state.growth,
            state.response,
            setUser,
            setResponse,
            setToast,
            clearToast,
            setUserType,
            setBusinessType,
            setSidebar,
            currentSidebar,
            setCollection,
            setResource,
            setLoading,
            unsetLoading,
        ],
    );

    return (
        <UserContext.Provider value={contextValues}>
            {props.children}
        </UserContext.Provider>
    );
};

export default UserState;
