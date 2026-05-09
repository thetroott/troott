import type AxiosService from '../_base/axios';
import type { IAPIResponse, IListQuery } from '../_base/types';
import { P } from '../_base/paths';

class SubscriptionAPI {
    constructor(private axiosService: AxiosService) {}

    /** Backend mounts GET `/` with auth only; wire when controller exists. */
    listSubscriptions(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.subscriptions.root,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    createSubscription(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.subscriptions.root,
            isAuth: true,
            payload,
        });
    }
}

export default SubscriptionAPI;
