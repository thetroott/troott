import type { IAPIResponse } from '@/utils/interface.utl';

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
} from '../config/path';
import type {
    AcceptListenerInvitationDTO,
    BulkInviteListenersDTO,
    InviteListenerDTO,
    OnboardMinistersDTO,
    OnboardTopicsDTO,
    SetListenerPasswordDTO,
    UpdateListenerDTO,
} from '../dtos/listener.dto';
import { BaseService } from '../config/api-call';
export class ListenerService extends BaseService {
    getCurrentListener(): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_LISTENER,
            isAuth: true,
        });
    }

    getListeners(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_LISTENER_LIST,
            isAuth: true,
            params,
        });
    }

    updateListener(payload: UpdateListenerDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'PUT',
            type: 'default',
            path: URL_LISTENER,
            isAuth: true,
            payload,
        });
    }

    updateInterests(payload: { interests: string[] }): Promise<IAPIResponse> {
        return this.call({
            method: 'PUT',
            type: 'default',
            path: URL_LISTENER_INTERESTS,
            isAuth: true,
            payload,
        });
    }

    inviteListener(payload: InviteListenerDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_INVITE,
            isAuth: true,
            payload,
        });
    }

    bulkInviteListeners(payload: BulkInviteListenersDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_INVITE_BULK,
            isAuth: true,
            payload,
        });
    }

    resendListenerInvite(payload: { email: string }): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_INVITE_RESEND,
            isAuth: true,
            payload,
        });
    }

    acceptListenerInvitation(
        payload: AcceptListenerInvitationDTO,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_INVITE_ACCEPT,
            isAuth: false,
            payload,
        });
    }

    revokeListenerInvitation(payload: {
        token?: string;
        email?: string;
    }): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_INVITE_REVOKE,
            isAuth: true,
            payload,
        });
    }

    setListenerPassword(payload: SetListenerPasswordDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_SET_PASSWORD,
            isAuth: true,
            payload,
        });
    }

    onboardTopics(payload: OnboardTopicsDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_ONBOARDING_TOPICS,
            isAuth: true,
            payload,
        });
    }

    onboardMinisters(payload: OnboardMinistersDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_ONBOARDING_MINISTERS,
            isAuth: true,
            payload,
        });
    }

    skipOnboarding(): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_LISTENER_ONBOARDING_SKIP,
            isAuth: true,
            payload: {},
        });
    }
}
