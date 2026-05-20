import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import { URL_OPEN_SERMON } from '../core/paths';

/** Public teaser content (rate-limited on the server). */
class OpenAPI {
    constructor(private axiosService: AxiosService) {}

    getPublicSermonTeaser(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_OPEN_SERMON(id),
            isAuth: false,
            payload: {},
        });
    }
}

export default OpenAPI;
