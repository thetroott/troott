import type { IAPIResponse } from '@/api/types';

import { URL_SUBSCRIPTIONS, URL_TRANSACTION } from '../config/path';
import { BaseService } from '../config/api-call';

export class SubscriptionService extends BaseService {
    getSubscriptions(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SUBSCRIPTIONS,
            isAuth: true,
            params,
        });
    }

    createSubscription(payload: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_SUBSCRIPTIONS,
            isAuth: true,
            payload,
        });
    }

    getTransactions(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_TRANSACTION,
            isAuth: true,
            params,
        });
    }
}
