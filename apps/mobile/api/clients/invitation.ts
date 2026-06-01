import type { IAPIResponse } from '@/api/types';

import {
    URL_INVITATION_BY_ID,
    URL_INVITATION_INVITEE,
    URL_INVITATION_INVITER,
    URL_INVITATION_RESOURCE,
} from '../config/path';
import { BaseService } from '../config/api-call';

export class InvitationService extends BaseService {
    getById(invitationId: string): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_INVITATION_BY_ID(invitationId),
            isAuth: true,
        });
    }

    getByInviter(
        inviterId: string,
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_INVITATION_INVITER(inviterId),
            isAuth: true,
            params,
        });
    }

    getByInvitee(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_INVITATION_INVITEE,
            isAuth: true,
            params,
        });
    }

    getByResource(
        resourceId: string,
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_INVITATION_RESOURCE(resourceId),
            isAuth: true,
            params,
        });
    }
}
