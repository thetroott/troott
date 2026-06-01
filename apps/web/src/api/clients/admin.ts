import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_ADMIN,
    URL_ADMIN_BY_ID,
    URL_ADMIN_INVITE,
    URL_ADMIN_INVITE_ACCEPT,
    URL_ADMIN_INVITE_REVOKE,
    URL_ADMIN_LIST,
    URL_ADMIN_SET_PASSWORD,
} from '../core/paths';
import type {
    AdminListQuery,
    InviteAdminDTO,
    SetAdminPasswordDTO,
    UpdateAdminProfileDTO,
} from '@/dtos/admin.dto';

class AdminAPI {
    constructor(private axiosService: AxiosService) {}

    getProfile(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_ADMIN,
            isAuth: true,
            payload: {},
        });
    }

    updateProfile(payload: UpdateAdminProfileDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_ADMIN,
            isAuth: true,
            payload,
        });
    }

    listAdmins(params?: AdminListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_ADMIN_LIST,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getAdmin(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_ADMIN_BY_ID(id),
            isAuth: true,
            payload: {},
        });
    }

    inviteAdmin(payload: InviteAdminDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_ADMIN_INVITE,
            isAuth: true,
            payload,
        });
    }

    revokeInvite(payload: Record<string, unknown>): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_ADMIN_INVITE_REVOKE,
            isAuth: true,
            payload,
        });
    }

    acceptInvitation(payload: Record<string, unknown>): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_ADMIN_INVITE_ACCEPT,
            isAuth: false,
            payload,
        });
    }

    setPassword(payload: SetAdminPasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_ADMIN_SET_PASSWORD,
            isAuth: true,
            payload,
        });
    }
}

export default AdminAPI;
