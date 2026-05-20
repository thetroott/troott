import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_STUDIO_BY_ID,
    URL_STUDIO_INVITE,
    URL_STUDIO_INVITE_ACCEPT,
    URL_STUDIO_INVITE_REJECT,
    URL_STUDIO_INVITES,
    URL_STUDIO_ME,
    URL_STUDIO_MINE_LIST,
    URL_STUDIOS,
} from '../core/paths';
import type {
    CreateStudioDTO,
    CreateStudioInviteDTO,
    UpdateStudioDTO,
} from '@/dtos/studio.dto';

class StudioAPI {
    constructor(private axiosService: AxiosService) {}

    createStudio(payload: CreateStudioDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_STUDIOS,
            isAuth: true,
            payload,
        });
    }

    getMyStudio(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_STUDIO_ME,
            isAuth: true,
            payload: {},
        });
    }

    listMyStudios(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_STUDIO_MINE_LIST,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getStudio(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_STUDIO_BY_ID(id),
            isAuth: true,
            payload: {},
        });
    }

    updateStudio(id: string, payload: UpdateStudioDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: URL_STUDIO_BY_ID(id),
            isAuth: true,
            payload,
        });
    }

    createStudioInvite(
        studioId: string,
        payload: CreateStudioInviteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_STUDIO_INVITES(studioId),
            isAuth: true,
            payload,
        });
    }

    deleteStudioInvite(
        studioId: string,
        inviteId: string,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: URL_STUDIO_INVITE(studioId, inviteId),
            isAuth: true,
            payload: {},
        });
    }

    acceptStudioInvite(
        studioId: string,
        inviteId: string,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_STUDIO_INVITE_ACCEPT(studioId, inviteId),
            isAuth: true,
            payload: {},
        });
    }

    rejectStudioInvite(
        studioId: string,
        inviteId: string,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_STUDIO_INVITE_REJECT(studioId, inviteId),
            isAuth: true,
            payload: {},
        });
    }
}

export default StudioAPI;
