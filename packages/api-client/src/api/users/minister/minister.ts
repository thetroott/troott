import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class MinisterAPI {
    constructor(private axiosService: AxiosService) {}

    getMinister(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.minister.root,
            isAuth: true,
        });
    }

    getMinisters(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.minister.list,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    updateMinister(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.minister.root,
            isAuth: true,
            payload,
        });
    }

    submitVerification(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.minister.verification,
            isAuth: true,
            payload,
        });
    }

    updateVerificationStatus(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.minister.verificationStatus,
            isAuth: true,
            payload,
        });
    }
}

export default MinisterAPI;
