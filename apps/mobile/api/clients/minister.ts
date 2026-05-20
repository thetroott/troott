import type { IAPIResponse } from '@/utils/interface.utl';

import {
    URL_MINISTER,
    URL_MINISTER_BY_ID,
    URL_MINISTER_LIST,
    URL_MINISTER_ONBOARDING_ADDRESS_COMPLETE,
    URL_MINISTER_ONBOARDING_DOCUMENT_COMPLETE,
    URL_MINISTER_ONBOARDING_FIRST_SERMON_COMPLETE,
    URL_MINISTER_ONBOARDING_MINISTRY_COMPLETE,
    URL_MINISTER_ONBOARDING_PERSONAL_COMPLETE,
    URL_MINISTER_ONBOARDING_SKIP,
    URL_MINISTER_ONBOARDING_TOUR_COMPLETE,
} from '../config/path';
import { BaseService } from '../config/api-call';

export class MinisterService extends BaseService {
    getCurrentMinister(): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_MINISTER,
            isAuth: true,
        });
    }

    getMinisters(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_MINISTER_LIST,
            isAuth: true,
            params,
        });
    }

    getMinisterById(id: string): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_MINISTER_BY_ID(id),
            isAuth: false,
        });
    }

    updateMinister(payload: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'PUT',
            type: 'default',
            path: URL_MINISTER,
            isAuth: true,
            payload,
        });
    }

    onboardingPersonalComplete(
        payload: Record<string, unknown> = {},
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_MINISTER_ONBOARDING_PERSONAL_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingDocumentComplete(
        payload: Record<string, unknown> = {},
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_MINISTER_ONBOARDING_DOCUMENT_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingAddressComplete(
        payload: Record<string, unknown> = {},
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_MINISTER_ONBOARDING_ADDRESS_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingMinistryComplete(
        payload: Record<string, unknown> = {},
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_MINISTER_ONBOARDING_MINISTRY_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingTourComplete(
        payload: Record<string, unknown> = {},
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_MINISTER_ONBOARDING_TOUR_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    onboardingFirstSermonComplete(
        payload: Record<string, unknown> = {},
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_MINISTER_ONBOARDING_FIRST_SERMON_COMPLETE,
            isAuth: true,
            payload,
        });
    }

    skipOnboarding(): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_MINISTER_ONBOARDING_SKIP,
            isAuth: true,
            payload: {},
        });
    }
}
