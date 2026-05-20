import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import { URL_SUBSCRIPTIONS } from '../core/paths';
import type { CreateSubscriptionDTO } from '@/dtos/subscription.dto';

class SubscriptionAPI {
    constructor(private axiosService: AxiosService) {}

    listSubscriptions(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_SUBSCRIPTIONS,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    createSubscription(payload: CreateSubscriptionDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_SUBSCRIPTIONS,
            isAuth: true,
            payload,
        });
    }
}

export default SubscriptionAPI;
