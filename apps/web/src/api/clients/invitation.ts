import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_INVITATION_BY_ID,
    URL_INVITATION_INVITEE,
    URL_INVITATION_INVITER,
    URL_INVITATION_RESOURCE,
} from '../core/paths';

class InvitationAPI {
    constructor(private axiosService: AxiosService) {}

    getById(invitationId: string, params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_INVITATION_BY_ID(invitationId),
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getByInviter(inviterId: string, params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_INVITATION_INVITER(inviterId),
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getByInvitee(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_INVITATION_INVITEE,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getByResource(resourceId: string, params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_INVITATION_RESOURCE(resourceId),
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }
}

export default InvitationAPI;
