import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class UserAPI {
    constructor(private axiosService: AxiosService) {}

    /** Current account (`GET /user`). */
    getCurrentAccount(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.user.me,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getUser(userId?: string, params?: IListQuery): Promise<IAPIResponse> {
        if (userId === undefined || userId === '') {
            return this.getCurrentAccount(params);
        }
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.user.list,
            isAuth: true,
            params: { ...(params as Record<string, unknown>), userId },
        });
    }

    getUsers(params?: IListQuery, _all?: boolean): Promise<IAPIResponse> {
        void _all;
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.user.list,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

        deactivateAccount(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: P.user.deactivate,
            isAuth: true,
        });
    }
}

export default UserAPI;
