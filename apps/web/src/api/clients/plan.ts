import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import { URL_PLANS, URL_PLAN_BY_ID } from '../core/paths';
import type { CreatePlanDTO, UpdatePlanDTO } from '@/dtos/plan.dto';

class PlanAPI {
    constructor(private axiosService: AxiosService) {}

    getPlans(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_PLANS,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    addPlan(payload: CreatePlanDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_PLANS,
            isAuth: true,
            payload,
        });
    }

    updatePlan(planId: string, payload: UpdatePlanDTO['updates']): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: URL_PLAN_BY_ID(planId),
            isAuth: true,
            payload,
        });
    }
}

export default PlanAPI;
