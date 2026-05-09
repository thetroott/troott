import type AxiosService from '../_base/axios';
import type { IAPIResponse, IListQuery } from '../_base/types';
import { P } from '../_base/paths';

class PlanAPI {
    constructor(private axiosService: AxiosService) {}

    getPlans(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.plans.root,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    addPlan(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.plans.root,
            isAuth: true,
            payload,
        });
    }

    updatePlan(planId: string, payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: P.plans.byId(planId),
            isAuth: true,
            payload,
        });
    }
}

export default PlanAPI;
