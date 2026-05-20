import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_LIBRARY,
    URL_LIBRARY_USER,
    URL_LIBRARY_USER_LIBRARY,
} from '../core/paths';

class LibraryAPI {
    constructor(private axiosService: AxiosService) {}

    getAllLibraries(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_LIBRARY,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    createLibrary(payload: FormData | Record<string, unknown>): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LIBRARY,
            isAuth: true,
            payload,
        });
    }

    getLibraryByUser(userId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_LIBRARY_USER(userId),
            isAuth: true,
            payload: {},
        });
    }

    getLibraryById(userId: string, libraryId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_LIBRARY_USER_LIBRARY(userId, libraryId),
            isAuth: true,
            payload: {},
        });
    }

    updateLibrary(
        userId: string,
        payload: FormData | Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_LIBRARY_USER(userId),
            isAuth: true,
            payload,
        });
    }

    deleteLibrary(userId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: URL_LIBRARY_USER(userId),
            isAuth: true,
            payload: {},
        });
    }
}

export default LibraryAPI;
