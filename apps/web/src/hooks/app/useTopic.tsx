import { MouseEvent, useCallback, useRef, useState } from 'react'
import { ICollection, IListQuery } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { GET_TOPIC, GET_TOPICS, } from '../../context/types'
import AxiosService from '../../services/axios.service'
import { URL_TOPIC } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import { ResourceType } from '../../utils/types.util'

interface ICreateTopic {
    name: string;
    label: string,
    description: string;
    isEnabled: any;
    careerId: string;
    skills: Array<string>;
    fields: Array<string>;
}

interface IUpdateTopic extends ICreateTopic {
    id: string
}

interface IChangeResource {
    id: string,
    resource: ResourceType,
    type: 'attach' | 'detach',
    skills?: Array<string>,
    fields?: Array<string>
}

const useTopic = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const { topics, topic, loading, loader, setCollection, setResource, setLoading, unsetLoading } = appContext;

    /**
     * @name createTopic
     */
    const createTopic = useCallback(async (data: ICreateTopic) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_TOPIC}`,
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

        return response

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name updateTopic
     */
    const updateTopic = useCallback(async (data: IUpdateTopic) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_TOPIC}/${data.id}`,
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
     * @name getTopics
     */
    const getTopics = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_TOPICS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_TOPIC}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} topics` : 'There are no topics currently'
                }

                setCollection(GET_TOPICS, result)

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_TOPICS,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get topics ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getResourceTopics
     */
    const getResourceTopics = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, resource, resourceId } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}&paginate=relative`;

        if (resource && resourceId) {

            setLoading({ option: 'resource', type: GET_TOPICS })

            const response = await AxiosService.call({
                type: 'default',
                method: 'GET',
                isAuth: true,
                path: `/${resource}/topics/${resourceId}?${q}`
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICollection = {
                        data: response.data,
                        count: response.count!,
                        total: response.total!,
                        pagination: response.pagination!,
                        loading: false,
                        message: response.data.length > 0 ? `displaying ${response.count!} topics` : 'There are no topics currently'
                    }

                    setCollection(GET_TOPICS, result)

                }

            }

            if (response.error === true) {

                unsetLoading({
                    option: 'resource',
                    type: GET_TOPICS,
                    message: response.message ? response.message : response.data
                })

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! Could not get topics ${response.data}`)
                }

            }

        } else {

            unsetLoading({
                option: 'resource',
                type: GET_TOPICS,
                message: 'invalid resource / resourceId'
            })

        }


    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getTopic
     */
    const getTopic = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_TOPIC}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                setResource(GET_TOPIC, response.data)
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
                console.log(`Error! Could not get topic ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])


    const changeResource = useCallback(async (data: IChangeResource) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_TOPIC}/${data.type}/${data.id}`,
            payload: {
                type: data.resource,
                skills: data.skills,
                fields: data.fields
            }
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'changes saved successfully'
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

    const deleteTopic = useCallback(async (id: string) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'DELETE',
            isAuth: true,
            path: `${URL_TOPIC}/${id}`,
            payload: {}
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'topic deleted successfully'
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

    }, [setLoading, unsetLoading])

    return {
        topics,
        topic,
        loading,
        loader,

        createTopic,
        updateTopic,
        getTopics,
        getResourceTopics,
        getTopic,
        changeResource,
        deleteTopic
    }
}

export default useTopic