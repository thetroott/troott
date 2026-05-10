import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ICollection, IListQuery } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { GET_SKILL, GET_SKILLS, } from '../../context/types'
import AxiosService from '../../services/axios.service'
import { URL_SKILL } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import useToast from '../useToast'
import helper from '../../utils/helper.util'
import { ResourceType } from '../../utils/types.util'

interface ICreateSkill {
    name: string,
    label: string,
    description: string,
    isEnabled: any,
    careerId: string,
    fields: Array<string>
}

interface IGenerateSkills {
    careerId: string, 
    fieldId: string, 
    action: string, 
    size: number,
    skills: Array<{ name: string, description: string }>
    topics: Array<{ name: string, skill: string, description: string }>
}

interface IUpdateSkill extends ICreateSkill {
    id: string
}

interface IChangeResource {
    id: string,
    resource: ResourceType,
    type: 'attach' | 'detach',
    careerId?: string,
    fields?: Array<string>
}

const useSkill = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)

    const {
        skills,
        skill,
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
     * @name getSkills
     */
    const getSkills = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_SKILLS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_SKILL}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} skills` : 'There are no skills currently'
                }

                setCollection(GET_SKILLS, result)

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_SKILLS,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get skills ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getResourceSkills
     */
    const getResourceSkills = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, resource, resourceId } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}&paginate=relative`;

        if (resource && resourceId) {

            setLoading({ option: 'resource', type: GET_SKILLS })

            const response = await AxiosService.call({
                type: 'default',
                method: 'GET',
                isAuth: true,
                path: `/${resource}/skills/${resourceId}?${q}`
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICollection = {
                        data: response.data,
                        count: response.count!,
                        total: response.total!,
                        pagination: response.pagination!,
                        loading: false,
                        message: response.data.length > 0 ? `displaying ${response.count!} skills` : 'There are no skills currently'
                    }

                    setCollection(GET_SKILLS, result)

                }

            }

            if (response.error === true) {

                unsetLoading({
                    option: 'resource',
                    type: GET_SKILLS,
                    message: response.message ? response.message : response.data
                })

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! Could not get skills ${response.data}`)
                }

            }

        } else {

            unsetLoading({
                option: 'resource',
                type: GET_SKILLS,
                message: 'invalid resource / resourceId'
            })

        }


    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getSkill
     */
    const getSkill = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_SKILL}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                setResource(GET_SKILL, response.data)
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
                console.log(`Error! Could not get skill ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name createSkill
     */
    const createSkill = useCallback(async (data: ICreateSkill) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_SKILL}`,
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
     * @name generateSkills
     */
    const generateSkills = useCallback(async (data: IGenerateSkills) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_SKILL}/generate`,
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
     * @name updateSkill
     */
    const updateSkill = useCallback(async (data: IUpdateSkill) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_SKILL}/${data.id}`,
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
     * @name changeResource
     */
    const changeResource = useCallback(async (data: IChangeResource) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_SKILL}/${data.type}/${data.id}`,
            payload: {
                type: data.resource,
                careerId: data.careerId,
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

    return {
        skills,
        skill,
        loading,
        loader,

        createSkill,
        generateSkills,
        updateSkill,
        getSkills,
        getResourceSkills,
        getSkill,
        changeResource
    }
}

export default useSkill