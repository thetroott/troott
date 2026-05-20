import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_MINISTER,
    URL_MINISTER_INVITE,
    URL_MINISTER_INVITE_ACCEPT,
    URL_MINISTER_INVITE_BULK,
    URL_MINISTER_INVITE_RESEND,
    URL_MINISTER_INVITE_REVOKE,
    URL_MINISTER_LIST,
    URL_MINISTER_ONBOARDING_ADDRESS_COMPLETE,
    URL_MINISTER_ONBOARDING_DOCUMENT_COMPLETE,
    URL_MINISTER_ONBOARDING_FIRST_SERMON_COMPLETE,
    URL_MINISTER_ONBOARDING_MINISTRY_COMPLETE,
    URL_MINISTER_ONBOARDING_PERSONAL_COMPLETE,
    URL_MINISTER_ONBOARDING_SKIP,
    URL_MINISTER_ONBOARDING_TOUR_COMPLETE,
    URL_MINISTER_SET_PASSWORD,
    URL_MINISTER_VERIFICATION,
    URL_MINISTER_VERIFICATION_STATUS,
} from '../core/paths';
import type {
    OnboardMinisterAddressCompleteDTO,
    OnboardMinisterDocumentCompleteDTO,
    OnboardMinisterFirstSermonCompleteDTO,
    OnboardMinisterMinistryCompleteDTO,
    OnboardMinisterPersonalCompleteDTO,
    OnboardMinisterSkipDTO,
    OnboardMinisterTourCompleteDTO,
    SubmitMinisterVerificationDTO,
    UpdateMinisterDTO,
} from '@/dtos/minister.dto';

/** Minister invite payloads mirror listener invite shape (`email`, optional `resourceId`). */
export interface MinisterInviteDTO {
    email: string;
    resourceId?: string;
}

export interface BulkMinisterInviteDTO {
    emails: string[];
    resourceId?: string;
}

class MinisterAPI {
    constructor(private axiosService: AxiosService) {}

    getMinister(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_MINISTER,
            isAuth: true,
            payload: {},
        });
    }

    getMinisters(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_MINISTER_LIST,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    updateMinister(payload: UpdateMinisterDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_MINISTER,
            isAuth: true,
            payload,
        });
    }

    submitVerification(
        payload: SubmitMinisterVerificationDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_VERIFICATION,
            isAuth: true,
            payload,
        });
    }

    onboardingPersonalComplete(
        payload: OnboardMinisterPersonalCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_ONBOARDING_PERSONAL_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingDocumentComplete(
        payload: OnboardMinisterDocumentCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_ONBOARDING_DOCUMENT_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingAddressComplete(
        payload: OnboardMinisterAddressCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_ONBOARDING_ADDRESS_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingMinistryComplete(
        payload: OnboardMinisterMinistryCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_ONBOARDING_MINISTRY_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingTourComplete(
        payload: OnboardMinisterTourCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_ONBOARDING_TOUR_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingFirstSermonComplete(
        payload: OnboardMinisterFirstSermonCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_ONBOARDING_FIRST_SERMON_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    skipMinisterOnboarding(
        payload: OnboardMinisterSkipDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_ONBOARDING_SKIP,
            isAuth: true,
            payload,
        });
    }

    updateVerificationStatus(
        payload: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_MINISTER_VERIFICATION_STATUS,
            isAuth: true,
            payload,
        });
    }

    inviteMinister(payload: MinisterInviteDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_INVITE,
            isAuth: true,
            payload,
        });
    }

    bulkInviteMinisters(payload: BulkMinisterInviteDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_INVITE_BULK,
            isAuth: true,
            payload,
        });
    }

    resendMinisterInvite(payload: { email: string }): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_INVITE_RESEND,
            isAuth: true,
            payload,
        });
    }

    acceptMinisterInvitation(
        payload: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_INVITE_ACCEPT,
            isAuth: false,
            payload,
        });
    }

    revokeMinisterInvitation(
        payload: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_INVITE_REVOKE,
            isAuth: true,
            payload,
        });
    }

    setMinisterPassword(payload: { password: string }): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_MINISTER_SET_PASSWORD,
            isAuth: true,
            payload,
        });
    }
}

export default MinisterAPI;
