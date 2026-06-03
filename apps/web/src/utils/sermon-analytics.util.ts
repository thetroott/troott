import type {
    AnalyticsBreakdownRow,
    AnalyticsDateRangePreset,
    AnalyticsOverviewResponse,
} from '@/types/analytics';
import {
    buildEmptyChartSeries,
    emptyAnalyticsOverview,
    formatCompareFrom,
    resolveDateRange,
} from '@/hooks/app/analytics-overview.util';
import { pickSermonDurationSeconds } from '@/utils/sermon-list-map.util';
import { isSermonDraftDocument } from '@/utils/sermon-info-map.util';
import { formatUploadPipelineLabel } from '@/utils/upload-pipeline-label.util';

export type SermonAnalyticsHeaderModel = {
    sermonId: string;
    title: string;
    thumbnailUrl: string | null;
    durationLabel: string;
    dateLabel: string;
    status: 'draft' | 'published';
    processingLabel: string | null;
};

function formatSecondsToLabel(totalSeconds: number): string {
    if (!totalSeconds || Number.isNaN(totalSeconds)) return '—';
    const s = Math.floor(totalSeconds % 60);
    const totalM = Math.floor(totalSeconds / 60);
    const h = Math.floor(totalM / 60);
    const m = totalM % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
}

function formatHeaderDate(doc: Record<string, unknown>): string {
    const raw =
        doc.publishedAt ??
        doc.releaseDate ??
        doc.preachedAt ??
        doc.createdAt;
    if (typeof raw === 'string' && raw.trim()) {
        const t = Date.parse(raw);
        if (Number.isFinite(t)) {
            return new Date(t).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    }
    return '—';
}

export function mapSermonDocToAnalyticsHeader(
    doc: Record<string, unknown>,
    sermonId: string,
): SermonAnalyticsHeaderModel {
    const imageSubdoc = doc.image as { item?: string } | undefined;
    const thumbnailUrl =
        typeof doc.imageUrl === 'string' && doc.imageUrl.trim()
            ? doc.imageUrl.trim()
            : typeof imageSubdoc?.item === 'string' && imageSubdoc.item.trim()
              ? imageSubdoc.item.trim()
              : null;
    const item = doc.item as { uploadStatus?: string } | undefined;
    const uploadStatus =
        item && typeof item.uploadStatus === 'string'
            ? item.uploadStatus
            : undefined;

    return {
        sermonId,
        title: String(doc.title ?? 'Untitled sermon'),
        thumbnailUrl,
        durationLabel: formatSecondsToLabel(pickSermonDurationSeconds(doc)),
        dateLabel: formatHeaderDate(doc),
        status: isSermonDraftDocument(doc) ? 'draft' : 'published',
        processingLabel: formatUploadPipelineLabel(uploadStatus),
    };
}

function parseListeningTimeToHours(raw: string | null | undefined): number {
    if (!raw?.trim()) {
        return 0;
    }
    const colon = raw.match(/^(\d+):(\d{2}):(\d{2})$/);
    if (colon) {
        const h = Number(colon[1]);
        const m = Number(colon[2]);
        const s = Number(colon[3]);
        return h + m / 60 + s / 3600;
    }
    const short = raw.match(/^(\d+):(\d{2})$/);
    if (short) {
        return Number(short[1]) / 60 + Number(short[2]) / 3600;
    }
    return 0;
}

/** Build overview-shaped metrics for sermon tab until sermon-scoped API exists. */
export function buildSermonScopedOverview(
    preset: AnalyticsDateRangePreset,
    breakdownRow: AnalyticsBreakdownRow | undefined,
    playCountFallback?: number,
): AnalyticsOverviewResponse {
    const base = emptyAnalyticsOverview(preset);
    const plays =
        breakdownRow?.plays ??
        (typeof playCountFallback === 'number' ? playCountFallback : 0) ??
        0;
    const listenHours = parseListeningTimeToHours(
        breakdownRow?.totalListeningTime,
    );
    const uniqueListeners = breakdownRow?.uniqueListeners ?? 0;
    const impressions = breakdownRow?.impressions ?? 0;

    const { dateFrom } = resolveDateRange(preset);
    const compareFrom = formatCompareFrom(new Date(`${dateFrom}T12:00:00`));
    const emptyKpi = { value: 0, deltaPercent: 0, compareFrom };

    const dayCount = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
    const chart = buildEmptyChartSeries(dayCount);
    if (plays > 0 && chart.length > 0) {
        const perDay = Math.max(1, Math.round(plays / chart.length));
        for (const point of chart) {
            point.value = perDay;
        }
    }

    return {
        kpis: {
            plays: { ...emptyKpi, value: plays },
            listenTimeHours: {
                ...emptyKpi,
                value: Math.round(listenHours * 10) / 10,
            },
            followers: { ...emptyKpi, value: uniqueListeners },
        },
        chart,
        live: {
            currentUsers: 0,
            newFollowers: impressions,
            avgPlayDurationSeconds: 0,
        },
    };
}

export type SermonAnalyticsKpiDisplay = {
    label: string;
    value: number;
    deltaPercent: number;
    compareLabel?: string;
    highlighted?: boolean;
};

export function sermonKpisFromOverview(
    data: AnalyticsOverviewResponse,
): SermonAnalyticsKpiDisplay[] {
    const { kpis, live } = data;
    return [
        {
            label: 'Plays',
            value: kpis.plays.value,
            deltaPercent: kpis.plays.deltaPercent,
            compareLabel: kpis.plays.compareFrom
                ? `From ${kpis.plays.compareFrom}`
                : undefined,
            highlighted: true,
        },
        {
            label: 'Impressions',
            value: live.newFollowers,
            deltaPercent: 0,
        },
        {
            label: 'Unique listeners',
            value: kpis.followers.value,
            deltaPercent: kpis.followers.deltaPercent,
            compareLabel: kpis.followers.compareFrom
                ? `From ${kpis.followers.compareFrom}`
                : undefined,
        },
    ];
}
