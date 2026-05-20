import type { IAPIResponse } from '@/utils/interface.utl';

import { URL_PLAN_BY_ID, URL_PLANS } from '../config/path';
import { BaseService } from '../config/api-call';

export class PlanService extends BaseService {
    getPlans(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_PLANS,
            isAuth: false,
            params,
        });
    }

    getPlanById(planId: string): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_PLAN_BY_ID(planId),
            isAuth: false,
        });
    }
}
