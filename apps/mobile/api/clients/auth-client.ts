/**
 * Auth HTTP calls using the shared {@link post} fetch client (`api/client.ts`).
 * Replaces the removed `apps/mobile/apis/auth` Axios layer.
 */
import { post } from '../client';
import { authEndpoints } from '../config/endpoints';
import type { IAPIResponse } from '@/utils/interface.utl';

async function postJson(
    url: string,
    body: unknown,
    options?: { skipAuth?: boolean },
): Promise<IAPIResponse> {
    return post<IAPIResponse>(url, body, {
        skipAuth: options?.skipAuth ?? false,
    });
}

export const authClient = {
    registerUser(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.register, payload, { skipAuth: true });
    },

    activateUser(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.activate, payload, { skipAuth: true });
    },

    loginUser(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.login, payload, { skipAuth: true });
    },

    forgotPassword(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.forgotPassword, payload, {
            skipAuth: true,
        });
    },

    resetPassword(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.resetPassword, payload, {
            skipAuth: true,
        });
    },

    resendOTP(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.resendOtp, payload, { skipAuth: true });
    },

    verifyOTP(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.verifyOtp, payload, { skipAuth: true });
    },

    changePassword(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.changePassword, payload, {
            skipAuth: false,
        });
    },

    logoutUser(payload: unknown): Promise<IAPIResponse> {
        return postJson(authEndpoints.logout, payload, { skipAuth: false });
    },
};

export default authClient;
