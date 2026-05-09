import AxiosService from '../_base/axios';
import { IAPIResponse } from '../_base/types';
import { P } from '../_base/paths';

class PermissionAPI {
    constructor(private axiosService: AxiosService) {}

    /**
     * Placeholder until backend exposes a dedicated permission router.
     */
    getPermissions(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.roles.list,
            isAuth: true,
            params,
        });
    }
}

export default PermissionAPI;
