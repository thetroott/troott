import React, { useMemo, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie';
import Axios from 'axios';
import storage from '../../utils/storage.util'
import loader from '../../utils/loader.util'
import { ICollection, IListQuery, ISetLoading, ISidebarProps, IToast, ITopbar, IUnsetLoading, IUserPermission } from '../../utils/interfaces.util';
import AxiosService from '../../services/axios.service';
import User from '../../models/User.model';
import { collection, sidebar, toast, topbar } from '../../_data/seed';
import sidebarRoutes from '../../routes/sidebar.route';

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
    SET_LOADER,
    SET_TOPBAR
} from '../types'

const UserState = (props: any) => {

    const initialState = {
        users: collection,
        user: {},
        talents: collection,
        talent: {},
        userType: '',
        items: [],
        loading: false,
        loader: false,
        toast: toast,
        sidebar: sidebar,
        topbar: topbar
    }

    const [state, dispatch] = useReducer(UserReducer, initialState);

    /**
     * @name setLoading
     * @param data 
     */
    const setLoading = async (data: ISetLoading) => {

        if (data.option === 'default') {
            dispatch({
                type: SET_LOADING
            })
        }

        if (data.option === 'loader') {
            dispatch({
                type: SET_LOADER,
                payload: true
            })
        }

        if (data.option === 'resource' && data.type) {

            const { loading, ...rest } = collection;

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: true
                }
            })

        }

    }

    /**
     * @name unsetLoading
     * @param data 
     */
    const unsetLoading = async (data: IUnsetLoading) => {

        if (data.option === 'default') {
            dispatch({
                type: UNSET_LOADING,
                payload: data.message
            })
        }

        if (data.option === 'loader') {
            dispatch({
                type: SET_LOADER,
                payload: false
            })
        }

        if (data.option === 'resource' && data.type) {

            const { loading, message, ...rest } = collection;

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: false,
                    message: data.message
                }
            })

        }

    }

    const setUserType = (type: string) => {

        dispatch({
            type: SET_USERTYPE,
            payload: type
        })

    }

    const setSidebar = (data: ISidebarProps) => {
        dispatch({
            type: SET_SIDEBAR,
            payload: data
        })
    }

     const setTopbar = (data: ITopbar) => {
        dispatch({
            type: SET_TOPBAR,
            payload: data
        })
    }

    const currentSidebar = (collapse: boolean): ISidebarProps | null => {

        let result: ISidebarProps | null = null;

        const name = storage.fetch('route.name');
        const sub = storage.fetch('route.subroute');

        const route = sidebarRoutes.find((x) => x.name === name);

        if (route && route.subroutes && route.subroutes.length > 0) {

            const subroute = route.subroutes.find((m) => m.name === sub);

            if (subroute) {
                result = {
                    collapsed: collapse,
                    route: route,
                    subroutes: route.subroutes,
                    inroutes: route.inroutes ? route.inroutes : [],
                    isOpen: true
                }
            } else {
                result = {
                    collapsed: collapse,
                    route: route,
                    subroutes: route.subroutes,
                    inroutes: route.inroutes ? route.inroutes : [],
                    isOpen: true
                }
            }

        } else if (route) {
            result = {
                collapsed: collapse,
                route: route,
                subroutes: route.subroutes ? route.subroutes : [],
                inroutes: route.inroutes ? route.inroutes : [],
                isOpen: false
            }
        }

        return result;

    }

    const setToast = (data: IToast) => {
        dispatch({
            type: SET_TOAST,
            payload: data
        })
    }

    const clearToast = () => {
        dispatch({
            type: SET_TOAST,
            payload: {
                type: 'success',
                show: false,
                message: '',
                title: 'Feedback',
                position: 'top-right',
            }
        })
    }

    const setCollection = (type: string, data: ICollection) => {
        dispatch({
            type: type,
            payload: data
        })
    }

    const setResource = (type: string, data: any) => {
        dispatch({
            type: type,
            payload: data
        })
    }

    const contextValues = useMemo(() => ({
        users: state.users,
        user: state.user,
        talents: state.talents,
        talent: state.talent,
        userType: state.userType,
        items: state.items,
        loading: state.loading,
        loader: state.loader,
        toast: state.toast,
        sidebar: state.sidebar,
        topbar: state.topbar,
        setToast: setToast,
        clearToast: clearToast,
        setUserType,
        setSidebar,
        setTopbar,
        currentSidebar,
        setCollection,
        setResource,
        setLoading,
        unsetLoading
    }), [
        state.users,
        state.user,
        state.talents,
        state.talent,
        state.userType,
        state.loading,
        state.loader,
        state.toast,
        state.items,
        state.sidebar,
        state.topbar,
        setToast,
        clearToast,
        setUserType,
        setSidebar,
        setTopbar,
        currentSidebar,
        setCollection,
        setResource,
        setLoading,
        unsetLoading
    ])

    return <UserContext.Provider
        value={contextValues}
    >
        {props.children}

    </UserContext.Provider>

}

export default UserState