import type {
    AnalyticsBreakdownParams,
    AnalyticsOverviewParams,
} from '@/types/analytics';

export const analyticsQueryKeys = {
    all: ['analytics'] as const,
    overview: (studioCode: string, params: AnalyticsOverviewParams) =>
        [...analyticsQueryKeys.all, 'overview', studioCode, params] as const,
    breakdown: (studioCode: string, params: AnalyticsBreakdownParams) =>
        [...analyticsQueryKeys.all, 'breakdown', studioCode, params] as const,
};
