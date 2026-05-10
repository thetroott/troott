import React, { useCallback, useContext, useEffect, useState } from 'react'
import useContextType from '../useContextType'
import storage from '../../utils/storage.util'
import AxiosService from '../../services/axios.service'
import { URL_LOGGEDIN_USER, URL_TALENTS, URL_USERS } from '../../utils/path.util'
import { GET_LOGGEDIN_USER, GET_TALENT, GET_TALENTS, GET_USER, GET_USERS, SET_ITEMS } from '../../context/types'
import { ICollection, IListQuery } from '../../utils/interfaces.util'
import useNetwork from '../useNetwork'
import useAuth from './useAuth'

interface ISendUsersUpdate {
    title: string,
    content: string,
    users: Array<string>
}

interface IInviteTalent {
    title: string,
    content: string,
    email: string,
    firstName: string,
    lastName: string,
    callbackUrl: string
}

const useUser = () => {

    const { userContext } = useContextType();
    const { logout } = useAuth()
    const { popNetwork } = useNetwork();
    const {
        users,
        user,
        talents,
        talent,
        items,
        loading,
        loader,
        setLoading,
        unsetLoading,
        setCollection,
        setResource
    } = userContext;

    useEffect(() => {

    }, [])

    const setItems = (data: Array<any>) => {
        setResource(SET_ITEMS, data);
    }

    /**
     * @name getFullname
     * @param data 
     * @returns 
     */
    const getFullname = (data: any) => {
        let result: string = '--'

        if (data && "firstName" in data && "lastName" in data) {
            result = `${data.firstName} ${data.lastName}`
        }

        return result;
    }

    const getUsers = useCallback(async (data: IListQuery, all: boolean = false) => {

        const { limit, page, select, order, cache, type } = data;
        let q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        if(cache !== undefined){
            q = cache === true ? q + `&cache=true` : q + `&cache=false`
        }

        if(type !== undefined && ['talent', 'business'].includes(type)){
            q = q + `&type=${type}`
        }
        

        setLoading({ option: 'resource', type: GET_USERS });

        const response = await AxiosService.call({
            type: 'backend',
            method: 'GET',
            isAuth: true,
            path: all? `${URL_USERS}/all?${q}` : `${URL_USERS}?${q}`
        });

        if (!response.error) {

            if (response.status === 200) {

                const result: ICollection = {
                    count: response.count!,
                    total: response.total!,
                    data: response.data,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} users` : 'There are no users currently'
                }
                setCollection(GET_USERS, result)

            }

        } else {
            unsetLoading({ option: 'default', message: response.message })
        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name getUser
     */
    const getUser = useCallback(async (id?: string) => {

        const userId = id ? id : storage.getUserID();

        setLoading({ option: 'default' });

        const response = await AxiosService.call({
            type: 'backend',
            method: 'GET',
            isAuth: true,
            path: `${URL_LOGGEDIN_USER}/${userId}`
        });

        if (!response.error) {
            setResource(GET_LOGGEDIN_USER, response.data)
            unsetLoading({ option: 'default', message: 'data fetched successfully' })
        } else {
            setResource(GET_LOGGEDIN_USER, {})
            unsetLoading({ option: 'default', message: response.message })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get careers ${response.data}`)
            }
        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name getTalents
     */
    const getTalents = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_TALENTS });

        const response = await AxiosService.call({
            type: 'backend',
            method: 'GET',
            isAuth: true,
            path: `${URL_TALENTS}?${q}`
        });

        if (!response.error) {

            if (response.status === 200) {

                const result: ICollection = {
                    count: response.count!,
                    total: response.total!,
                    data: response.data,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} talents` : 'There are no talents currently'
                }
                setCollection(GET_TALENTS, result)

            }

        } else {
            unsetLoading({ option: 'default', message: response.message })
        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name getTalent
     */
    const getTalent = useCallback(async (id?: string) => {

        const userId = id ? id : storage.getUserID();

        setLoading({ option: 'default' });

        const response = await AxiosService.call({
            type: 'backend',
            method: 'GET',
            isAuth: true,
            path: `${URL_TALENTS}/${userId}`
        });

        if (!response.error) {
            setResource(GET_TALENT, response.data)
            unsetLoading({ option: 'default', message: 'data fetched successfully' })
        } else {
            setResource(GET_TALENT, {})
            unsetLoading({ option: 'default', message: response.message })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get talents ${response.data}`)
            }
        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name sendUsersUpdate
     */
    const sendUsersUpdate = useCallback(async (data: ISendUsersUpdate) => {

        setLoading({ option: 'loader' });

        const response = await AxiosService.call({
            type: 'backend',
            method: 'POST',
            isAuth: true,
            path: `${URL_USERS}/send-update`,
            payload: { ...data }
        });

        if (!response.error) {
            unsetLoading({ option: 'loader', message: 'successful' })
        } else {
            unsetLoading({ option: 'loader', message: response.message })

            if (response.status === 401) {
                logout
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not send verification code ${response.data}`)
            }
        }

        return response;

    }, [setLoading, unsetLoading])

    /**
     * @name inviteTalent
     */
    const inviteTalent = useCallback(async (data: IInviteTalent) => {

        setLoading({ option: 'loader' });

        const response = await AxiosService.call({
            type: 'backend',
            method: 'POST',
            isAuth: true,
            path: `${URL_USERS}/invite-talent`,
            payload: { ...data }
        });

        if (!response.error) {
            unsetLoading({ option: 'loader', message: 'successful' })
        } else {
            unsetLoading({ option: 'loader', message: response.message })

            if (response.status === 401) {
                logout
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not send invite talent ${response.data}`)
            }
        }

        return response;

    }, [setLoading, unsetLoading]);



    return {
        users,
        user,
        talents,
        talent,
        loading,
        loader,
        items,

        getFullname,
        setItems,

        getUsers,
        getUser,
        getTalents,
        getTalent,

        sendUsersUpdate,
        inviteTalent
    }
}

export default useUser