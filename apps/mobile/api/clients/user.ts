/**
 * User account API (`/user`).
 *
 * Partner / legacy Pacepard user routes are not part of Troott; use
 * {@link listenerService} for listener profile updates.
 */
import type { IAPIResponse } from '@/utils/interface.utl';

import { userEndpoints } from '../config/endpoints';
import { BaseService } from '../config/api-call';

export class UsersService extends BaseService {
    /**
     * Staff user list (`GET /user/list`).
     */
    async getUsers(params?: { limit?: number; offset?: number }): Promise<IAPIResponse> {
        const queryParams = new URLSearchParams();
        if (params?.limit) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params?.offset) {
            queryParams.append('offset', params.offset.toString());
        }

        const endpoint = queryParams.toString()
            ? `${userEndpoints.list}?${queryParams.toString()}`
            : userEndpoints.list;

        return this.call({
            method: 'GET',
            type: 'default',
            path: endpoint,
            isAuth: true,
        });
    }

    /**
     * Current authenticated user (`GET /user`).
     */
    async getCurrentUser(): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: userEndpoints.me,
            isAuth: true,
        });
    }

    /**
     * Deactivate the signed-in account (`DELETE /user/deactivate`).
     */
    async deleteMe(): Promise<IAPIResponse> {
        return this.call({
            method: 'DELETE',
            type: 'default',
            path: userEndpoints.deactivate,
            isAuth: true,
        });
    }
}

export const usersService = new UsersService();
