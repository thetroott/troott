import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class InvitationAPI {
    constructor(private axiosService: AxiosService) {}

    getById(invitationId: string, params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.invitation.byId(invitationId),
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getByInviter(inviterId: string, params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.invitation.inviter(inviterId),
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getByInvitee(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.invitation.invitee,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getByResource(resourceId: string, params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.invitation.resource(resourceId),
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }
}

export default InvitationAPI;
