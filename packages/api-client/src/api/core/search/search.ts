import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class SearchAPI {
    constructor(private axiosService: AxiosService) {}

    searchCatalog(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.search.root,
            isAuth: false,
            params: params as Record<string, unknown> | undefined,
        });
    }
}

export default SearchAPI;
