import AxiosService from '../../_base/axios';
import { IAPIResponse } from '../../_base/types';
import { P } from '../../_base/paths';

class ListenerAPI {
    constructor(private axiosService: AxiosService) {}

    getCurrentListener(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.listener.root,
            isAuth: true,
        });
    }

    getListeners(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.listener.list,
            isAuth: true,
            params,
        });
    }

    updateListener(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.listener.root,
            isAuth: true,
            payload,
        });
    }

    updateInterests(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.listener.interests,
            isAuth: true,
            payload,
        });
    }
}

export default ListenerAPI;
