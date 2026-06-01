import type AxiosService from '@/api/core/axios';
import {
    URL_STUDIO_ANALYTICS_BREAKDOWN,
    URL_STUDIO_ANALYTICS_OVERVIEW,
} from '../core/paths';
import type { IAPIResponse } from '@/api/types';
import type {
    AnalyticsBreakdownParams,
    AnalyticsOverviewParams,
} from '@/types/analytics';

class AnalyticsAPI {
    constructor(private axiosService: AxiosService) {}

    getOverview(
        studioCode: string,
        params: AnalyticsOverviewParams,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_STUDIO_ANALYTICS_OVERVIEW(studioCode),
            isAuth: true,
            params: params as unknown as Record<string, unknown>,
        });
    }

    getBreakdown(
        studioCode: string,
        params: AnalyticsBreakdownParams,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_STUDIO_ANALYTICS_BREAKDOWN(studioCode),
            isAuth: true,
            params: params as unknown as Record<string, unknown>,
        });
    }
}

export default AnalyticsAPI;
