import AxiosService from '../../_base/axios';
import { IAPIResponse } from '../../_base/types';
import { P } from '../../_base/paths';

class AdminAPI {
    constructor(private axiosService: AxiosService) {}

    getAdminProfile(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.admin.root,
            isAuth: true,
        });
    }

    updateCurrentAdmin(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.admin.root,
            isAuth: true,
            payload,
        });
    }

    getAdmins(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.admin.list,
            isAuth: true,
            params,
        });
    }

    getAdminById(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.admin.byId(id),
            isAuth: true,
        });
    }
}

export default AdminAPI;
