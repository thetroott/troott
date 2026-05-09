import React, { MouseEvent, useCallback, useEffect, useState } from 'react'
import { ICollection, IListQuery } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { GET_GROUP, GET_GROUPS } from '../../context/types'
import AxiosService from '../../services/axios.service'
import { URL_GROUPS } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import storage from '../../utils/storage.util'
import { ITalentGroup } from '../../models/Talent.model'
import Group from '../../models/Group.model'

interface ICreateGroup {
    type: string,
    name: string,
    careerId?: string,
    fieldId?: string,
    description?: string,
    members: Array<string>
}

interface IOrganizeGroup {
    action: 'create' | 'attach' | 'detach',
    name?: string,
    description?: string,
    parent?:any,
    groups: Array<any>
}

interface IExtractGroup {
    groups: Array<ITalentGroup>
    type: 'business' | 'talent',
    id: string
}

const useGroup = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const {
        groups,
        group,
        loading,
        setCollection,
        setResource,
        setLoading,
        unsetLoading
    } = appContext;

    /**
     * @name extractGroup
     * @param data 
     */
    const extractGroup = (data: IExtractGroup) => {

        const { groups, id, type } = data;

        let extract: Array<ITalentGroup> = [];
        let result: Array<Group> = [];

        if (type === 'business') {
            extract = groups.filter((g) => g.business !== null && g.talent === null);
            if (extract.length > 0) {
                const list = extract.filter((e) => e.business === id);
                result = list.map((g) => g.group);
            }

        } else {
            extract = groups.filter((g) => g.business === null && g.talent !== null);
            if (extract.length > 0) {
                const list = extract.filter((e) => e.business === id);
                result = list.map((g) => g.group);
            }
        }

        // console.log("GD", result)

        return result;

    }

    /**
     * @name getGroups
     */
    const getGroups = useCallback(async (data: IListQuery): Promise<any> => {

        const { limit, page, order, payload } = data;
        let q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        if(payload && payload.parent){
            q = q + `&parent=${payload.parent}`
        }

        setLoading({ option: 'resource', type: GET_GROUPS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_GROUPS}/groups?${q}`,
        })

        if (response.error === false) {

            const result: ICollection = {
                data: response.data,
                count: response.count!,
                total: response.total!,
                pagination: response.pagination!,
                loading: false,
                message: response.data.length > 0 ? `displaying ${response.count!} talent groups` : 'There are no groups currently'
            }

            setCollection(GET_GROUPS, result)

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_GROUPS,
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

    /**
     * @name getGroup
     */
    const getGroup = useCallback(async (id: string): Promise<any> => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_GROUPS}/${id}`,
        })

        if (response.error === false) {

            setResource(GET_GROUP, response.data);

            unsetLoading({
                option: 'default',
                message: 'successful'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_GROUPS,
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

    /**
     * @name getResourceGroups
     */
    const getResourceGroups = useCallback(async (data: IListQuery): Promise<any> => {

        const { limit, page, select, order, resource, resourceId } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}&paginate=relative`;

        if (resource && resourceId) {

            setLoading({ option: 'resource', type: GET_GROUPS })

            const response = await AxiosService.call({
                type: 'default',
                method: 'GET',
                isAuth: true,
                path: `/${resource}/groups/${resourceId}?${q}`
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICollection = {
                        data: response.data,
                        count: response.count!,
                        total: response.total!,
                        pagination: response.pagination!,
                        loading: false,
                        message: response.data.length > 0 ? `displaying ${response.count!} talent groups` : 'There are no groups currently'
                    }

                    setCollection(GET_GROUPS, result)

                }

            }

            if (response.error === true) {

                unsetLoading({
                    option: 'resource',
                    type: GET_GROUPS,
                    message: response.message ? response.message : response.data
                })

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! Could not get talent groups ${response.data}`)
                }

            }

        } else {

            unsetLoading({
                option: 'resource',
                type: GET_GROUPS,
                message: 'invalid resource / resourceId'
            })

        }


    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name createGroup
    */
    const createGroup = useCallback(async (data: ICreateGroup): Promise<any> => {

        const id = storage.getUserID();

        const { members, name, type, careerId, description, fieldId } = data;

        setLoading({ option: 'default', type: GET_GROUPS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_GROUPS}`,
            payload: {
                members,
                name,
                type,
                careerId,
                description,
                fieldId,
                owner: id
            }
        })

        if (response.error === false) {

            unsetLoading({
                option: 'default',
                message: 'successful'
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

        }

        return response;

    }, [setLoading, unsetLoading])

    /**
     * @name organizeGroup
     */
    const organizeGroup = useCallback(async (data: IOrganizeGroup): Promise<any> => {

        const id = storage.getUserID();

        const { action, groups, description, name, parent } = data;

        setLoading({ option: 'default', type: GET_GROUPS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_GROUPS}/organize`,
            payload: {
                groups,
                name,
                description,
                owner: id,
                action,
                parent
            }
        })

        if (response.error === false) {

            unsetLoading({
                option: 'default',
                message: 'successful'
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

        }

        return response;

    }, [setLoading, unsetLoading])

    return {
        groups,
        group,
        loading,

        extractGroup,

        getResourceGroups,
        getGroups,
        getGroup,
        createGroup,
        organizeGroup,
    }
}

export default useGroup