import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class ShareAPI {
    constructor(private axiosService: AxiosService) {}

    resolveShareLink(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.share.resolve,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }
}

export default ShareAPI;
