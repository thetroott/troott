import type { IAPIResponse } from '@/utils/interface.utl';

import { URL_USER, URL_USER_DEACTIVATE, URL_USER_LIST } from '../config/path';
import { BaseService } from '../config/api-call';
export class UserService extends BaseService {
    getUsers(params?: {
        limit?: number;
        offset?: number;
    }): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_USER_LIST,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getCurrentUser(): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_USER,
            isAuth: true,
        });
    }

    updateProfile(payload: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'PUT',
            type: 'default',
            path: URL_USER,
            isAuth: true,
            payload,
        });
    }

    deleteMe(): Promise<IAPIResponse> {
        return this.call({
            method: 'DELETE',
            type: 'default',
            path: URL_USER_DEACTIVATE,
            isAuth: true,
        });
    }
}
