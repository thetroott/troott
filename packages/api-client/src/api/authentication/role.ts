import AxiosService from '../_base/axios';
import { IAPIResponse } from '../_base/types';
import { P } from '../_base/paths';

class RoleAPI {
    constructor(private axiosService: AxiosService) {}

    getRoles(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.roles.list,
            isAuth: true,
            params,
        });
    }

    getRoleById(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.roles.byId(id),
            isAuth: true,
        });
    }
}

export default RoleAPI;
