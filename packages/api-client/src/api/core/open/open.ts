import type AxiosService from '../../_base/axios';
import type { IAPIResponse } from '../../_base/types';
import { P } from '../../_base/paths';

/** Public teaser content (rate-limited on the server). */
class OpenAPI {
    constructor(private axiosService: AxiosService) {}

    getPublicSermonTeaser(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.open.sermon(id),
            isAuth: false,
        });
    }
}

export default OpenAPI;
