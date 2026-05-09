import type AxiosService from '../../_base/axios';
import type { IAPIResponse } from '../../_base/types';
import { P } from '../../_base/paths';

class ProfileAPI {
    constructor(private axiosService: AxiosService) {}

    getMe(): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.profile.me,
            isAuth: true,
        });
    }

    updateMe(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.profile.me,
            isAuth: true,
            payload,
        });
    }
}

export default ProfileAPI;
