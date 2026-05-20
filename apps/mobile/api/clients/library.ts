import type { IAPIResponse } from '@/utils/interface.utl';

import {
    URL_LIBRARY,
    URL_LIBRARY_USER,
    URL_LIBRARY_USER_LIBRARY,
} from '../config/path';
import { BaseService } from '../config/api-call';

export class LibraryService extends BaseService {
    getAllLibraries(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_LIBRARY,
            isAuth: true,
            params,
        });
    }

    createLibrary(
        payload: FormData | Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LIBRARY,
            isAuth: true,
            payload,
        });
    }

    getLibraryByUser(userId: string): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_LIBRARY_USER(userId),
            isAuth: true,
        });
    }

    getLibraryById(
        userId: string,
        libraryId: string,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_LIBRARY_USER_LIBRARY(userId, libraryId),
            isAuth: true,
        });
    }

    updateLibrary(
        userId: string,
        payload: FormData | Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'PUT',
            type: 'default',
            path: URL_LIBRARY_USER(userId),
            isAuth: true,
            payload,
        });
    }

    deleteLibrary(userId: string): Promise<IAPIResponse> {
        return this.call({
            method: 'DELETE',
            type: 'default',
            path: URL_LIBRARY_USER(userId),
            isAuth: true,
        });
    }
}
