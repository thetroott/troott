import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ICollection, IListQuery, IUserContext } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { GET_INDUSTRIES, GET_INDUSTRY } from '../../context/types'
import AxiosService from '../../services/axios.service'
import { URL_INDUSTRY } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import useToast from '../useToast'
import helper from '../../utils/helper.util'


interface ICreateIndustry {
    name: string,
    label: string,
    description: string,
    isEnabled: any,
}

interface IUpdateIndustry extends ICreateIndustry{
    id: string
}

const useIndustry = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const { 
        industries, 
        industry, 
        loading, 
        loader,
        setCollection, 
        setResource, 
        setLoading, 
        unsetLoading 

    } = appContext


    useEffect(() => {

    }, [])

    /**
    * @name createIndustry
    */
    const createIndustry = useCallback(async (data: ICreateIndustry) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_INDUSTRY}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'data saved successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response;

    }, [setLoading, unsetLoading, setResource])

    /**
        * @name updateIndustry
        */
    const updateIndustry = useCallback(async (data: IUpdateIndustry) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_INDUSTRY}/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'data saved successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }

        }

        return response;

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name getIndustries
     */
    const getIndustries = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_INDUSTRIES })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_INDUSTRY}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} industries` : 'There are no industries currently'
                }

                setCollection(GET_INDUSTRIES, result)

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_INDUSTRIES,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get industries ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getResourceIndustries
     */
    const getResourceIndustries = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, resource, resourceId } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}&paginate=relative`;

        if (resource && resourceId) {

            setLoading({ option: 'resource', type: GET_INDUSTRIES })

            const response = await AxiosService.call({
                type: 'default',
                method: 'GET',
                isAuth: true,
                path: `/${resource}/industries/${resourceId}?${q}`
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICollection = {
                        data: response.data,
                        count: response.count!,
                        total: response.total!,
                        pagination: response.pagination!,
                        loading: false,
                        message: response.data.length > 0 ? `displaying ${response.count!} industries` : 'There are no industries currently'
                    }

                    setCollection(GET_INDUSTRIES, result)

                }

            }

            if (response.error === true) {

                unsetLoading({
                    option: 'resource',
                    type: GET_INDUSTRIES,
                    message: response.message ? response.message : response.data
                })

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! Could not get industries ${response.data}`)
                }

            }

        } else {

            unsetLoading({
                option: 'resource',
                type: GET_INDUSTRIES,
                message: 'invalid resource / resourceId'
            })

        }


    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getIndustry
     */
    const getIndustry = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_INDUSTRY}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                setResource(GET_INDUSTRY, response.data)
            }

            unsetLoading({
                option: 'default',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }
            else if (response.data) {
                console.log(`Error! Could not get industry ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])

    return {
        industries,
        industry,
        loading,
        loader,

        createIndustry,
        updateIndustry,
        getIndustries,
        getResourceIndustries,
        getIndustry
    }
}

export default useIndustry