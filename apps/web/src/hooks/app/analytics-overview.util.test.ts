import { describe, expect, it } from 'vitest';
import {
    buildEmptyChartSeries,
    emptyAnalyticsBreakdown,
    emptyAnalyticsOverview,
    resolveDateRange,
} from '@/hooks/app/analytics-overview.util';

describe('analytics-overview.util', () => {
    it('buildEmptyChartSeries returns zero values', () => {
        const series = buildEmptyChartSeries(7);
        expect(series).toHaveLength(7);
        expect(series.every((p) => p.value === 0)).toBe(true);
    });

    it('emptyAnalyticsOverview uses compare label from range', () => {
        const overview = emptyAnalyticsOverview('30d');
        expect(overview.kpis.plays.value).toBe(0);
        expect(overview.kpis.plays.compareFrom).toMatch(/^[A-Za-z]{3}/);
    });

    it('emptyAnalyticsBreakdown includes No Data row', () => {
        const breakdown = emptyAnalyticsBreakdown();
        expect(breakdown.rows[0]?.sermonTitle).toBe('No Data');
    });

    it('resolveDateRange returns ISO date strings', () => {
        const { dateFrom, dateTo } = resolveDateRange('7d');
        expect(dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(dateTo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
