import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class LibraryAPI {
    constructor(private axiosService: AxiosService) {}

    getAllLibraries(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.library.root,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    createLibrary(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.library.root,
            isAuth: true,
            payload,
        });
    }

    getLibraryByUser(userId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.library.user(userId),
            isAuth: true,
        });
    }

    getLibraryById(userId: string, libraryId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.library.userLibrary(userId, libraryId),
            isAuth: true,
        });
    }

    updateLibrary(userId: string, payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.library.user(userId),
            isAuth: true,
            payload,
        });
    }

    deleteLibrary(userId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: P.library.user(userId),
            isAuth: true,
        });
    }
}

export default LibraryAPI;
