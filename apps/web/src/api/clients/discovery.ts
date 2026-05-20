import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import { URL_DISCOVERY_HOME } from '../core/paths';

class DiscoveryAPI {
    constructor(private axiosService: AxiosService) {}

    getHome(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_DISCOVERY_HOME,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }
}

export default DiscoveryAPI;
