import { MouseEvent, useCallback, useRef, useState } from 'react'
import { ICollection, IListQuery } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { GET_FIELD, GET_FIELDS } from '../../context/types'
import AxiosService from '../../services/axios.service'
import { URL_FIELD } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import useToast from '../useToast'
import helper from '../../utils/helper.util'
import { FormActionType, ResourceType } from '../../utils/types.util'

interface ICreateField {
    name: string,
    label: string,
    description: string,
    isEnabled: any,
    careerId: string,
    skills: Array<string>
}

interface IUPdateField extends ICreateField {
    id: string
}

interface IChangeResource {
    id: string,
    resource: ResourceType,
    type: 'attach' | 'detach',
    careerId?: string,
    skills?: Array<string>
}

const useField = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const { fields, field, loading, loader, setCollection, setResource, setLoading, unsetLoading } = appContext


    /**
     * @name getFields
     */
    const getFields = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_FIELDS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_FIELD}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} fields` : 'There are no fields currently'
                }

                setCollection(GET_FIELDS, result)

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_FIELDS,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get fields ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getResourceFields
     */
    const getResourceFields = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, resource, resourceId } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}&paginate=relative`;

        if (resource && resourceId) {

            setLoading({ option: 'resource', type: GET_FIELDS })

            const response = await AxiosService.call({
                type: 'default',
                method: 'GET',
                isAuth: true,
                path: `/${resource}/fields/${resourceId}?${q}`
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICollection = {
                        data: response.data,
                        count: response.count!,
                        total: response.total!,
                        pagination: response.pagination!,
                        loading: false,
                        message: response.data.length > 0 ? `displaying ${response.count!} fields` : 'There are no fields currently'
                    }

                    setCollection(GET_FIELDS, result)

                }

            }

            if (response.error === true) {

                unsetLoading({
                    option: 'resource',
                    type: GET_FIELDS,
                    message: response.message ? response.message : response.data
                })

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! Could not get fields ${response.data}`)
                }

            }

        } else {

            unsetLoading({
                option: 'resource',
                type: GET_FIELDS,
                message: 'invalid resource / resourceId'
            })

        }


    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getField
     */
    const getField = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_FIELD}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                setResource(GET_FIELD, response.data)
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
                console.log(`Error! Could not get field ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])


    /**
    * @name createField
    */
    const createField = useCallback(async (data: ICreateField) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_FIELD}`,
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
    * @name updateField
    */
    const updateField = useCallback(async (data: IUPdateField) => {


        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_FIELD}/${data.id}`,
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
     * @name changeFieldResource
     */
    const changeFieldResource = useCallback(async (data: IChangeResource) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_FIELD}/${data.type}/${data.id}`,
            payload: {
                type: data.resource,
                careerId: data.careerId,
                skills: data.skills
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

    const deleteField = useCallback(async (id: string) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'DELETE',
            isAuth: true,
            path: `${URL_FIELD}/${id}?type=permanent`,
            payload: {}
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'field deleted successfully'
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
        fields,
        field,
        loading,
        loader,

        getFields,
        getResourceFields,
        getField,
        createField,
        updateField,
        changeFieldResource,
        deleteField
    }
}

export default useField