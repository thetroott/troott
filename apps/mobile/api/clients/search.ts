import type { IAPIResponse } from '@/utils/interface.utl';

import {
    URL_SEARCH,
    URL_SEARCH_AUTOCOMPLETE,
    URL_SEARCH_MINISTERS,
    URL_SEARCH_PLAYLISTS,
    URL_SEARCH_POPULAR,
    URL_SEARCH_RECENT,
    URL_SEARCH_SERIES,
    URL_SEARCH_SERMONS,
    URL_SEARCH_TOPICS,
    URL_SEARCH_TRENDING,
} from '../config/path';
import { BaseService } from '../config/api-call';

export class SearchService extends BaseService {
    searchCatalog(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH,
            isAuth: false,
            params,
        });
    }

    searchSermons(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_SERMONS,
            isAuth: false,
            params,
        });
    }

    searchMinisters(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_MINISTERS,
            isAuth: false,
            params,
        });
    }

    searchSeries(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_SERIES,
            isAuth: false,
            params,
        });
    }

    searchPlaylists(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_PLAYLISTS,
            isAuth: false,
            params,
        });
    }

    searchTopics(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_TOPICS,
            isAuth: false,
            params,
        });
    }

    searchTrending(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_TRENDING,
            isAuth: false,
            params,
        });
    }

    searchPopular(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_POPULAR,
            isAuth: false,
            params,
        });
    }

    searchRecent(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_RECENT,
            isAuth: true,
            params,
        });
    }

    searchAutocomplete(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SEARCH_AUTOCOMPLETE,
            isAuth: false,
            params,
        });
    }
}
