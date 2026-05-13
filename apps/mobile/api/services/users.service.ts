/**
 * User account API (`/user`).
 *
 * Partner / legacy Pacepard user routes are not part of Troott; use
 * {@link listenerService} for listener profile updates.
 */
import { userEndpoints } from '../config/endpoints';
import type { ApiResponse, GetUsersParams, User } from '../types';
import { BaseService } from './base.service';

export class UsersService extends BaseService {
    /**
     * Staff user list (`GET /user/list`).
     */
    async getUsers(params?: GetUsersParams): Promise<User[]> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const endpoint = queryParams.toString()
            ? `${userEndpoints.list}?${queryParams.toString()}`
            : userEndpoints.list;

        const response = await this.get<ApiResponse<User[]>>(endpoint);
        return this.extractData(response as ApiResponse<User[]>) || [];
    }

    /**
     * Current authenticated user (`GET /user`).
     */
    async getCurrentUser(): Promise<User> {
        const response = await this.get<ApiResponse<User>>(userEndpoints.me);
        return this.extractData(response as ApiResponse<User>);
    }

    /**
     * Deactivate the signed-in account (`DELETE /user/deactivate`).
     */
    async deleteMe(): Promise<{ message: string }> {
        const response = await this.delete<{ message: string }>(
            userEndpoints.deactivate,
        );
        return this.extractData(response);
    }
}

export const usersService = new UsersService();
