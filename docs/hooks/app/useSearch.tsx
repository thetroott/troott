import React, { useCallback, useContext, useEffect, useState } from 'react'
import { IPageSearch, ICollection, IListQuery } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { SET_SEARCH } from '../../context/types';
import AxiosService from '../../services/axios.service';
import useNetwork from '../useNetwork';
import { collection } from '../../_data/seed';

interface IUseSearch {

}

interface IFilters {
    isEnabled?: boolean,
    industryId?: string,
    careerId?: string,
    fieldId?: string,
    skillId?: string,
    topicId?: string,
    skills?: Array<string>,
    fields?: Array<string>,
    topics?: Array<string>
}

const useSearch = (props: IUseSearch) => {

    const { popNetwork } = useNetwork()
    const { appContext } = useContextType();
    const {
        search,
        setLoading,
        unsetLoading,
        setCollection
    } = appContext;

    const [pageSearch, setPageSearch] = useState<IPageSearch>({ key: '', type: 'search', hasResult: false })
    const [filters, setFilters] = useState<IFilters>({})

    useEffect(() => {

    }, []);

    const clearSearch = () => {
        setPageSearch({ ...pageSearch, key: pageSearch.key, hasResult: false, refine: 'default', payload: {} })
        setCollection(SET_SEARCH, collection)
        setFilters({})
    }

    /**
     * @name searchResource
     */
    const searchResource = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, resource, key, payload, paginate, report } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}&paginate=${paginate ? paginate : 'absolute'}`;

        if (resource) {

            setLoading({ option: 'resource', type: SET_SEARCH })

            let rp = report !== undefined ? report : false;
            let pld = payload ? { key: key, ...payload, report: rp } : { key: key, report: rp };

            const response = await AxiosService.call({
                type: 'backend',
                method: 'POST',
                isAuth: true,
                path: `/${resource}/search?${q}`,
                payload: pld
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICollection = {
                        data: response.data,
                        report: response.report,
                        count: response.data.length > 0 ? response.data.length : -1,
                        total: response.total!,
                        pagination: response.pagination!,
                        payload: pld,
                        refineType: 'search',
                        loading: false,
                        message: response.data.length > 0 ? `displaying ${response.count!} ${resource}` : `There are no ${resource} currently`
                    }

                    setPageSearch({
                        ...pageSearch,
                        key: key ? key : '',
                        hasResult: response.data.length > 0 ? true : false,
                        payload: pld,
                        refine: 'search'
                    })

                    setCollection(SET_SEARCH, result)

                }

            }

            if (response.error === true) {

                unsetLoading({
                    option: 'resource',
                    type: SET_SEARCH,
                    message: response.message ? response.message : response.data
                })

                clearSearch()

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! could not search ${resource} ${response.data}`)
                }

            }

        } else {

            unsetLoading({
                option: 'resource',
                type: SET_SEARCH,
                message: 'invalid resource / resourceId'
            })

        }


    }, [setLoading, unsetLoading, setCollection]);

    /**
     * @name filterResource
     */
    const filterResource = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, resource, payload, paginate, report } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}&paginate=${paginate ? paginate : 'absolute'}`;

        if (resource) {

            setLoading({ option: 'resource', type: SET_SEARCH });

            let rp = report !== undefined ? report : false;
            let pld = { ...payload, report: rp }
            const response = await AxiosService.call({
                type: 'backend',
                method: 'POST',
                isAuth: true,
                path: `/${resource}/filter?${q}`,
                payload: pld
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICollection = {
                        data: response.data,
                        report: response.report,
                        count: response.data.length > 0 ? response.data.length : -1,
                        total: response.total!,
                        pagination: response.pagination!,
                        payload: { ...payload },
                        refineType: 'filter',
                        loading: false,
                        message: response.data.length > 0 ? `displaying ${response.count!} ${resource}` : `There are no ${resource} currently`
                    }

                    setPageSearch({
                        ...pageSearch,
                        key: 'filters',
                        hasResult: response.data.length > 0 ? true : false,
                        payload: pld,
                        refine: 'filter'
                    })

                    setCollection(SET_SEARCH, result)

                }

            }

            if (response.error === true) {

                unsetLoading({
                    option: 'resource',
                    type: SET_SEARCH,
                    message: response.message ? response.message : response.data
                })

                clearSearch()

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! Could not filter ${resource} ${response.data}`)
                }

            }

        } else {

            unsetLoading({
                option: 'resource',
                type: SET_SEARCH,
                message: 'invalid resource / resourceId'
            })

        }


    }, [setLoading, unsetLoading, setCollection]);

    return {
        search,
        pageSearch,
        filters,

        setPageSearch,
        searchResource,
        filterResource,
        setFilters,
        clearSearch
    }

}

export default useSearch