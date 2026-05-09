import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class PreferenceAPI {
    constructor(private axiosService: AxiosService) {}

    getAllPreferences(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.preference.root,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getMyPreferences(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.preference.me,
            isAuth: true,
        });
    }

    patchMyPreferences(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: P.preference.me,
            isAuth: true,
            payload,
        });
    }

    createPreferences(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.preference.root,
            isAuth: true,
            payload,
        });
    }

    getUserPreferences(userId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.preference.byUser(userId),
            isAuth: true,
        });
    }

    updateUserPreferences(
        userId: string,
        payload: unknown,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: P.preference.byUser(userId),
            isAuth: true,
            payload,
        });
    }

    deletePreferences(userId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: P.preference.byUser(userId),
            isAuth: true,
        });
    }
}

export default PreferenceAPI;
