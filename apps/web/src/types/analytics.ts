export type AnalyticsPrimaryTab = 'overview' | 'sermon' | 'series';

export type AnalyticsGranularity = 'daily' | 'weekly' | 'monthly';

export type AnalyticsDateRangePreset = '7d' | '30d' | '90d';

export type BreakdownDimension = 'sermon' | 'region' | 'source';

export interface AnalyticsKpiMetric {
    value: number;
    deltaPercent: number;
    compareFrom: string;
}

export interface AnalyticsOverviewResponse {
    kpis: {
        plays: AnalyticsKpiMetric;
        listenTimeHours: AnalyticsKpiMetric;
        followers: AnalyticsKpiMetric;
    };
    chart: { date: string; value: number }[];
    live: {
        currentUsers: number;
        newFollowers: number;
        avgPlayDurationSeconds: number;
    };
}

export interface AnalyticsBreakdownRow {
    id: string;
    sermonTitle: string;
    sermonDate?: string;
    thumbnailUrl?: string;
    durationLabel?: string;
    plays: number | null;
    impressions: number | null;
    uniqueListeners: number | null;
    totalListeningTime: string | null;
    avgListeningTime: string | null;
}

export interface AnalyticsBreakdownResponse {
    rows: AnalyticsBreakdownRow[];
    total: number;
}

export interface AnalyticsOverviewParams {
    dateFrom: string;
    dateTo: string;
    granularity: AnalyticsGranularity;
}

export interface AnalyticsBreakdownParams extends AnalyticsOverviewParams {
    dimension: BreakdownDimension;
    q?: string;
}
