import './clients/troott';
import axios from 'axios';
import { troottAPIClient } from '@troott/api-client';
import { WEB_API_BASE_URL } from './clients/troott';
import storage from '../utils/storage.util';
import logger from '@/utils/logger.util';

const rawApiUrl = (
    import.meta.env.VITE_APP_API_URL ||
    ''
)?.trim();
if (!rawApiUrl && import.meta.env.DEV) {
    logger.log({
        type: 'warning',
        label: 'DEV',
        data: 'VITE_APP_API_URL unset — clients/troott uses localhost placeholder.',
    });
}

logger.log({
    data: WEB_API_BASE_URL,
    label: 'API base URL',
    type: 'info',
});

export const axiosPublic = axios.create({
    baseURL: WEB_API_BASE_URL,
    headers: storage.getConfig().headers,
});

export const axiosPrivate = troottAPIClient().getHttpClient();
axiosPrivate.defaults.withCredentials = true;

const client = troottAPIClient();
const asLegacyAxios = <T,>(result: T) =>
    ({ data: result } as unknown as { data: T });

const apiCall: any = {
    auth: {
        register: (payload: unknown) =>
            client.auth.registerUser(payload as never) as Promise<any>,
        activateUser: (payload: unknown) =>
            client.auth.activateUser(payload as never) as Promise<any>,
        login: (payload: unknown) =>
            client.auth.loginUser(payload as never) as Promise<any>,
        verifyOTP: (payload: unknown) =>
            client.auth.verifyOTP(payload as never) as Promise<any>,
        resendOTP: (payload: unknown) =>
            client.auth.resendOTP(payload as never) as Promise<any>,
        getToken: (payload: unknown) =>
            client.auth.getToken(payload as never) as Promise<any>,
        changePassword: (payload: unknown) =>
            client.auth.changePassword(payload as never) as Promise<any>,
        logout: (payload: unknown) =>
            client.auth.logoutUser(payload as never) as Promise<any>,
        forgotPassword: (payload: unknown) =>
            client.auth.forgotPassword(payload as never) as Promise<any>,
        resetPassword: (payload: unknown) =>
            client.auth.resetPassword(payload as never) as Promise<any>,
    },
    sermon: {
        getSermons: async (payload?: Record<string, unknown>) =>
            asLegacyAxios(await client.sermon.getAllSermons(payload)),
        getSermonsByMinister: async (
            ministerId: string,
            params?: Record<string, unknown>,
        ) => asLegacyAxios(await client.sermon.getSermonsByMinister(ministerId, params)),
        updateSermon: (id: string, payload: unknown) =>
            client.sermon.updateSermon(id, payload) as Promise<any>,
        moveSermonToBin: (id: string, payload?: unknown) =>
            client.sermon.moveSermonToBin(id, payload) as Promise<any>,
        startUpload: async (
            formData: FormData,
            onProgress?: (percent: number) => void,
            signal?: AbortSignal,
        ) => asLegacyAxios(await client.sermon.startUpload(formData, onProgress, signal)),
        uploadCover: async (
            formData: FormData,
            onProgress?: (percent: number) => void,
        ) => asLegacyAxios(await client.sermon.uploadCover(formData, onProgress)),
        publishSermon: (id: string, payload: unknown) =>
            client.sermon.publishSermon(id, payload) as Promise<any>,
        getSermonById: async (id: string) =>
            asLegacyAxios(await client.sermon.getSermonById(id)),
    },
    profile: {
        getMe: async () => asLegacyAxios(await client.profile.getMe()),
        updateMe: async (payload: unknown) =>
            asLegacyAxios(await client.profile.updateMe(payload)),
    },
    storage: {
        uploadImage: async (file: File, onProgress?: (percent: number) => void) => {
            const form = new FormData();
            form.append('file', file);
            return asLegacyAxios(await client.storage.uploadImage(form, onProgress));
        },
    },
    user: {
        getUsers: (payload?: unknown) =>
            client.user.getUsers(payload as never) as Promise<any>,
        getUser: (payload?: unknown) => {
            const userId =
                payload && typeof payload === 'object' && 'userId' in payload
                    ? String((payload as { userId?: unknown }).userId ?? '')
                    : payload
                      ? String(payload)
                      : undefined;
            return client.user.getUser(userId) as Promise<any>;
        },
    },
};

export default apiCall;
