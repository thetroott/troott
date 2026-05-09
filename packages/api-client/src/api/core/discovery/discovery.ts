import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class DiscoveryAPI {
    constructor(private axiosService: AxiosService) {}

    getHome(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.discovery.home,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }
}

export default DiscoveryAPI;
