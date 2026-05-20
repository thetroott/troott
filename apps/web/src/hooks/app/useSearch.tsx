import { useCallback, useEffect, useState } from 'react';

import api from '@/api/config';
import { SET_SEARCH } from '@/context/types';
import type { IAPIResponse } from '@/api/types';
import type { ICollection, IListQuery, IPageSearch } from '@/utils/interfaces.util';
import { collection } from '@/_data/seed';

import useAuth from './useAuth';
import useContextType from '../shared/useContextType';
import useNetwork from '../shared/useNetwork';

interface IUseSearch {
    //
}

interface IFilters {
    isEnabled?: boolean;
    industryId?: string;
    careerId?: string;
    fieldId?: string;
    skillId?: string;
    topicId?: string;
    skills?: Array<string>;
    fields?: Array<string>;
    topics?: Array<string>;
}

function listParamsFromSearchQuery(data: IListQuery): Record<string, unknown> {
    const { limit, page, select, order, resource, key, payload, paginate, report, ...rest } =
        data;
    void resource;
    void key;
    void paginate;
    return {
        limit: limit ?? 25,
        page: page ?? 1,
        ...(select !== undefined && { select }),
        ...(order !== undefined && { order }),
        ...(payload && typeof payload === 'object' ? payload : {}),
        ...(report !== undefined && { report }),
        ...rest,
    };
}

async function dispatchSearchByResource(
    resource: string | undefined,
    params: Record<string, unknown>,
): Promise<IAPIResponse> {
    const p = params as IListQuery;
    switch (resource) {
        case 'sermons':
            return api.search.searchSermons(p);
        case 'ministers':
            return api.search.searchMinisters(p);
        case 'topics':
            return api.search.searchTopics(p);
        case 'playlists':
            return api.search.searchPlaylists(p);
        case 'series':
            return api.search.searchSeries(p);
        default:
            return api.search.searchCatalog(p);
    }
}

const useSearch = (_props: IUseSearch) => {
    const { popNetwork } = useNetwork();
    const { logout } = useAuth();
    const { appContext } = useContextType();
    const { search, setLoading, unsetLoading, setCollection } = appContext;

    const [pageSearch, setPageSearch] = useState<IPageSearch>({
        key: '',
        type: 'search',
        hasResult: false,
    });
    const [filters, setFilters] = useState<IFilters>({});

    useEffect(() => {}, []);

    const clearSearch = () => {
        setPageSearch({
            ...pageSearch,
            key: pageSearch.key,
            hasResult: false,
            refine: 'default',
            payload: {},
        });
        setCollection(SET_SEARCH, collection);
        setFilters({});
    };

    /**
     * @name searchResource
     */
    const searchResource = useCallback(
        async (data: IListQuery) => {
            const { resource, key, payload } = data;
            const qParams = listParamsFromSearchQuery(data);

            if (!resource) {
                await unsetLoading({
                    option: 'resource',
                    type: SET_SEARCH,
                    message: 'invalid resource / resourceId',
                });
                return;
            }

            setLoading({ option: 'resource', type: SET_SEARCH });

            const response = await dispatchSearchByResource(resource, qParams);

            if (response.error === false && response.status === 200) {
                const rows = Array.isArray(response.data) ? response.data : [];
                const result = {
                    data: rows,
                    count:
                        rows.length > 0 ? rows.length : (response.count ?? 0),
                    total: response.total ?? rows.length,
                    pagination:
                        response.pagination ?? {
                            next: { page: 1, limit: 25 },
                            prev: { page: 1, limit: 25 },
                        },
                    loading: false,
                    message:
                        rows.length > 0
                            ? `displaying ${response.count ?? rows.length} ${resource}`
                            : `There are no ${resource} currently`,
                } satisfies ICollection;

                setPageSearch({
                    ...pageSearch,
                    key: key ? key : '',
                    hasResult: rows.length > 0,
                    payload: payload
                        ? { key, ...payload, report: data.report ?? false }
                        : { key, report: data.report ?? false },
                    refine: 'search',
                });

                setCollection(SET_SEARCH, result);
            }

            if (response.error === true) {
                await unsetLoading({
                    option: 'resource',
                    type: SET_SEARCH,
                    message: response.message
                        ? response.message
                        : String(response.data),
                });
                clearSearch();
                if (response.status === 401) {
                    void logout();
                } else if (response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(
                        `Error! could not search ${resource} ${response.data}`,
                    );
                }
            }
        },
        [
            setLoading,
            unsetLoading,
            setCollection,
            pageSearch,
            logout,
            popNetwork,
        ],
    );

    /**
     * @name filterResource
     */
    const filterResource = useCallback(
        async (data: IListQuery) => {
            const { resource, payload } = data;
            const qParams = listParamsFromSearchQuery(data);

            if (!resource) {
                await unsetLoading({
                    option: 'resource',
                    type: SET_SEARCH,
                    message: 'invalid resource / resourceId',
                });
                return;
            }

            setLoading({ option: 'resource', type: SET_SEARCH });

            const merged = {
                ...qParams,
                ...(payload && typeof payload === 'object' ? payload : {}),
            };

            const response = await dispatchSearchByResource(resource, merged);

            if (response.error === false && response.status === 200) {
                const rows = Array.isArray(response.data) ? response.data : [];
                const result = {
                    data: rows,
                    count:
                        rows.length > 0 ? rows.length : (response.count ?? 0),
                    total: response.total ?? rows.length,
                    pagination:
                        response.pagination ?? {
                            next: { page: 1, limit: 25 },
                            prev: { page: 1, limit: 25 },
                        },
                    loading: false,
                    message:
                        rows.length > 0
                            ? `displaying ${response.count ?? rows.length} ${resource}`
                            : `There are no ${resource} currently`,
                } satisfies ICollection;

                setPageSearch({
                    ...pageSearch,
                    key: 'filters',
                    hasResult: rows.length > 0,
                    payload: merged,
                    refine: 'filter',
                });

                setCollection(SET_SEARCH, result);
            }

            if (response.error === true) {
                await unsetLoading({
                    option: 'resource',
                    type: SET_SEARCH,
                    message: response.message
                        ? response.message
                        : String(response.data),
                });
                clearSearch();
                if (response.status === 401) {
                    void logout();
                } else if (response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(
                        `Error! Could not filter ${resource} ${response.data}`,
                    );
                }
            }
        },
        [
            setLoading,
            unsetLoading,
            setCollection,
            pageSearch,
            logout,
            popNetwork,
        ],
    );

    return {
        search,
        pageSearch,
        filters,

        setPageSearch,
        searchResource,
        filterResource,
        setFilters,
        clearSearch,
    };
};

export default useSearch;
