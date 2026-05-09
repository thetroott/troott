import type AxiosService from '../_base/axios';
import type { IAPIResponse } from '../_base/types';
import { P } from '../_base/paths';

class PushAPI {
    constructor(private axiosService: AxiosService) {}

    registerDevice(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.notifications.device,
            isAuth: true,
            payload,
        });
    }

    removeDevice(payload?: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: P.notifications.device,
            isAuth: true,
            payload,
        });
    }

    listDevices(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.notifications.device,
            isAuth: true,
        });
    }
}

export default PushAPI;
