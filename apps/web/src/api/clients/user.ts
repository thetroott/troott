import type AxiosService from '@/api/core/axios';
import { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import type { EditUserDTO } from '@/dtos/user.dto';
import { URL_USER, URL_USER_DEACTIVATE, URL_USER_LIST } from '../core/paths';

class UserAPI {
    constructor(private axiosService: AxiosService) {}

    getCurrentAccount(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_USER,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    updateProfile(payload: EditUserDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_USER,
            isAuth: true,
            payload,
        });
    }

    getUser(userId?: string, params?: IListQuery): Promise<IAPIResponse> {
        if (userId === undefined || userId === '') {
            return this.getCurrentAccount(params);
        }
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_USER_LIST,
            isAuth: true,
            params: {
                ...(params as Record<string, unknown>),
                userId,
            },
        });
    }

    getUsers(params?: IListQuery, _all?: boolean): Promise<IAPIResponse> {
        void _all;
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_USER_LIST,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    deactivateAccount(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: URL_USER_DEACTIVATE,
            isAuth: true,
            payload: {},
        });
    }
}

export default UserAPI;
