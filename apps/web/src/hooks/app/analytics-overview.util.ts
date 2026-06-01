import type {
    AnalyticsBreakdownResponse,
    AnalyticsDateRangePreset,
    AnalyticsGranularity,
    AnalyticsOverviewResponse,
} from '@/types/analytics';

export function formatCompareFrom(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function resolveDateRange(preset: AnalyticsDateRangePreset): {
    dateFrom: string;
    dateTo: string;
} {
    const dateTo = new Date();
    const dateFrom = new Date();
    const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
    dateFrom.setDate(dateTo.getDate() - (days - 1));
    return {
        dateFrom: dateFrom.toISOString().slice(0, 10),
        dateTo: dateTo.toISOString().slice(0, 10),
    };
}

export function buildEmptyChartSeries(dayCount: number): { date: string; value: number }[] {
    const points: { date: string; value: number }[] = [];
    const end = new Date();
    for (let i = dayCount - 1; i >= 0; i -= 1) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        points.push({
            date: d.toISOString().slice(0, 10),
            value: 0,
        });
    }
    return points;
}

export function emptyAnalyticsOverview(
    preset: AnalyticsDateRangePreset = '30d',
): AnalyticsOverviewResponse {
    const { dateFrom } = resolveDateRange(preset);
    const compareFrom = formatCompareFrom(new Date(`${dateFrom}T12:00:00`));
    const dayCount = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
    const emptyKpi = { value: 0, deltaPercent: 0, compareFrom };
    return {
        kpis: {
            plays: { ...emptyKpi },
            listenTimeHours: { ...emptyKpi },
            followers: { ...emptyKpi },
        },
        chart: buildEmptyChartSeries(dayCount),
        live: {
            currentUsers: 0,
            newFollowers: 0,
            avgPlayDurationSeconds: 0,
        },
    };
}

export function emptyAnalyticsBreakdown(): AnalyticsBreakdownResponse {
    return {
        rows: [
            {
                id: 'empty',
                sermonTitle: 'No Data',
                plays: null,
                impressions: null,
                uniqueListeners: null,
                totalListeningTime: null,
                avgListeningTime: null,
            },
        ],
        total: 0,
    };
}

export function formatDurationSeconds(totalSeconds: number): string {
    if (totalSeconds <= 0) {
        return '0s';
    }
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const GRANULARITY_LABELS: Record<AnalyticsGranularity, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
};

export const DATE_RANGE_LABELS: Record<AnalyticsDateRangePreset, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
};
