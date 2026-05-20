import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_SEARCH,
    URL_SEARCH_AUTOCOMPLETE,
    URL_SEARCH_MINISTERS,
    URL_SEARCH_MINISTER_SCOPED,
    URL_SEARCH_PLAYLISTS,
    URL_SEARCH_POPULAR,
    URL_SEARCH_RECENT,
    URL_SEARCH_RECENT_BY_ID,
    URL_SEARCH_SERIES,
    URL_SEARCH_SERIES_SCOPED,
    URL_SEARCH_SERMONS,
    URL_SEARCH_TOPICS,
    URL_SEARCH_TRENDING,
} from '../core/paths';

class SearchAPI {
    constructor(private axiosService: AxiosService) {}

    searchCatalog(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    searchSermons(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_SERMONS,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    searchMinisters(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_MINISTERS,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    searchSeries(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_SERIES,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    searchPlaylists(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_PLAYLISTS,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    searchTopics(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_TOPICS,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    searchWithinMinister(
        ministerId: string,
        params?: IListQuery,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_MINISTER_SCOPED(ministerId),
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    searchWithinSeries(
        seriesId: string,
        params?: IListQuery,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_SERIES_SCOPED(seriesId),
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    autocomplete(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_AUTOCOMPLETE,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getTrending(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_TRENDING,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getPopular(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_POPULAR,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getRecentSearches(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SEARCH_RECENT,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    saveRecentSearch(payload: Record<string, unknown>): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_SEARCH_RECENT,
            isAuth: true,
            payload,
        });
    }

    clearRecentSearches(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: URL_SEARCH_RECENT,
            isAuth: true,
            payload: {},
        });
    }

    deleteRecentSearch(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: URL_SEARCH_RECENT_BY_ID(id),
            isAuth: true,
            payload: {},
        });
    }
}

export default SearchAPI;
