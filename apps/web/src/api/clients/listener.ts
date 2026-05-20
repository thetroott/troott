import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_LISTENER,
    URL_LISTENER_INTERESTS,
    URL_LISTENER_INVITE,
    URL_LISTENER_INVITE_ACCEPT,
    URL_LISTENER_INVITE_BULK,
    URL_LISTENER_INVITE_RESEND,
    URL_LISTENER_INVITE_REVOKE,
    URL_LISTENER_LIST,
    URL_LISTENER_ONBOARDING_MINISTERS,
    URL_LISTENER_ONBOARDING_SKIP,
    URL_LISTENER_ONBOARDING_TOPICS,
    URL_LISTENER_SET_PASSWORD,
} from '../core/paths';
import type {
    AcceptListenerInvitationDTO,
    BulkInviteListenersDTO,
    InviteListenerDTO,
    OnboardMinistersDTO,
    OnboardTopicsDTO,
    SetListenerPasswordDTO,
    UpdateListenerDTO,
} from '@/dtos/listener.dto';

class ListenerAPI {
    constructor(private axiosService: AxiosService) {}

    getCurrentListener(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_LISTENER,
            isAuth: true,
            payload: {},
        });
    }

    getListeners(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_LISTENER_LIST,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    updateListener(payload: UpdateListenerDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_LISTENER,
            isAuth: true,
            payload,
        });
    }

    updateInterests(payload: { interests: string[] }): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_LISTENER_INTERESTS,
            isAuth: true,
            payload,
        });
    }

    inviteListener(payload: InviteListenerDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_INVITE,
            isAuth: true,
            payload,
        });
    }

    bulkInviteListeners(payload: BulkInviteListenersDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_INVITE_BULK,
            isAuth: true,
            payload,
        });
    }

    resendListenerInvite(payload: { email: string }): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_INVITE_RESEND,
            isAuth: true,
            payload,
        });
    }

    acceptListenerInvitation(
        payload: AcceptListenerInvitationDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_INVITE_ACCEPT,
            isAuth: false,
            payload,
        });
    }

    revokeListenerInvitation(payload: { token?: string; email?: string }): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_INVITE_REVOKE,
            isAuth: true,
            payload,
        });
    }

    setListenerPassword(payload: SetListenerPasswordDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_SET_PASSWORD,
            isAuth: true,
            payload,
        });
    }

    onboardTopics(payload: OnboardTopicsDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_ONBOARDING_TOPICS,
            isAuth: true,
            payload,
        });
    }

    onboardMinisters(payload: OnboardMinistersDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_ONBOARDING_MINISTERS,
            isAuth: true,
            payload,
        });
    }

    skipOnboarding(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_LISTENER_ONBOARDING_SKIP,
            isAuth: true,
            payload: {},
        });
    }
}

export default ListenerAPI;
