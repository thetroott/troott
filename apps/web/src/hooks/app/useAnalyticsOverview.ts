import { useQuery } from '@tanstack/react-query';
import api from '@/api/config';
import { analyticsQueryKeys } from '@/constants/analytics-query-keys';
import type {
    AnalyticsBreakdownParams,
    AnalyticsBreakdownResponse,
    AnalyticsDateRangePreset,
    AnalyticsOverviewParams,
    AnalyticsOverviewResponse,
} from '@/types/analytics';
import {
    emptyAnalyticsBreakdown,
    emptyAnalyticsOverview,
} from '@/hooks/app/analytics-overview.util';

function parseOverviewPayload(data: unknown): AnalyticsOverviewResponse | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const o = data as AnalyticsOverviewResponse;
    if (!o.kpis || !o.chart || !o.live) {
        return null;
    }
    return o;
}

function parseBreakdownPayload(data: unknown): AnalyticsBreakdownResponse | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const o = data as AnalyticsBreakdownResponse;
    if (!Array.isArray(o.rows)) {
        return null;
    }
    return o;
}

export function useAnalyticsOverview(
    studioCode: string | undefined,
    params: AnalyticsOverviewParams,
    dateRangePreset: AnalyticsDateRangePreset = '30d',
) {
    return useQuery({
        queryKey: analyticsQueryKeys.overview(studioCode ?? '', params),
        enabled: Boolean(studioCode?.trim()),
        queryFn: async () => {
            const res = await api.analytics.getOverview(studioCode!, params);
            if (res.error || res.status === 404) {
                return emptyAnalyticsOverview(dateRangePreset);
            }
            const parsed = parseOverviewPayload(res.data);
            return parsed ?? emptyAnalyticsOverview(dateRangePreset);
        },
    });
}

export function useAnalyticsBreakdown(
    studioCode: string | undefined,
    params: AnalyticsBreakdownParams,
) {
    return useQuery({
        queryKey: analyticsQueryKeys.breakdown(studioCode ?? '', params),
        enabled: Boolean(studioCode?.trim()),
        queryFn: async () => {
            if (params.dimension !== 'sermon') {
                return { rows: [], total: 0 };
            }
            const res = await api.analytics.getBreakdown(studioCode!, params);
            if (res.error || res.status === 404) {
                return emptyAnalyticsBreakdown();
            }
            const parsed = parseBreakdownPayload(res.data);
            if (!parsed || parsed.rows.length === 0) {
                return emptyAnalyticsBreakdown();
            }
            return parsed;
        },
    });
}
