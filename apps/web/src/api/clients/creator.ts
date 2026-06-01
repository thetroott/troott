import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_CREATOR,
    URL_CREATOR_LIST,
    URL_CREATOR_ONBOARDING_ADDRESS_COMPLETE,
    URL_CREATOR_ONBOARDING_DOCUMENT_COMPLETE,
    URL_CREATOR_ONBOARDING_FIRST_SERMON_COMPLETE,
    URL_CREATOR_ONBOARDING_MINISTRY_COMPLETE,
    URL_CREATOR_ONBOARDING_PERSONAL_COMPLETE,
    URL_CREATOR_ONBOARDING_SKIP,
    URL_CREATOR_ONBOARDING_TOUR_COMPLETE,
    URL_CREATOR_VERIFICATION,
} from '../core/paths';
import type {
    OnboardCreatorAddressCompleteDTO,
    OnboardCreatorDocumentCompleteDTO,
    OnboardCreatorFirstSermonCompleteDTO,
    OnboardCreatorMinistryCompleteDTO,
    OnboardCreatorPersonalCompleteDTO,
    OnboardCreatorSkipDTO,
    OnboardCreatorTourCompleteDTO,
    SubmitCreatorVerificationDTO,
    UpdateCreatorDTO,
} from '@/dtos/creator.dto';

class CreatorAPI {
    constructor(private axiosService: AxiosService) {}

    getCreator(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_CREATOR,
            isAuth: true,
            payload: {},
        });
    }

    getCreators(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_CREATOR_LIST,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    updateCreator(payload: UpdateCreatorDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_CREATOR,
            isAuth: true,
            payload,
        });
    }

    submitVerification(
        payload: SubmitCreatorVerificationDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CREATOR_VERIFICATION,
            isAuth: true,
            payload,
        });
    }

    onboardingPersonalComplete(
        payload: OnboardCreatorPersonalCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CREATOR_ONBOARDING_PERSONAL_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingDocumentComplete(
        payload: OnboardCreatorDocumentCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CREATOR_ONBOARDING_DOCUMENT_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingAddressComplete(
        payload: OnboardCreatorAddressCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CREATOR_ONBOARDING_ADDRESS_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingMinistryComplete(
        payload: OnboardCreatorMinistryCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CREATOR_ONBOARDING_MINISTRY_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingTourComplete(
        payload: OnboardCreatorTourCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CREATOR_ONBOARDING_TOUR_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingFirstSermonComplete(
        payload: OnboardCreatorFirstSermonCompleteDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CREATOR_ONBOARDING_FIRST_SERMON_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    skipCreatorOnboarding(payload: OnboardCreatorSkipDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_CREATOR_ONBOARDING_SKIP,
            isAuth: true,
            payload,
        });
    }
}

export default CreatorAPI;
