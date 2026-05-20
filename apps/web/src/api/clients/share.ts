import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import { URL_SHARE_RESOLVE } from '../core/paths';

class ShareAPI {
    constructor(private axiosService: AxiosService) {}

    resolveShareLink(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SHARE_RESOLVE,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }
}

export default ShareAPI;
