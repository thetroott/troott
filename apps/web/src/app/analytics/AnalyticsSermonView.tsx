import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AnalyticsBreakdownSection from '@/components/shared/analytics/AnalyticsBreakdownSection';
import AnalyticsFilterBar from '@/components/shared/analytics/AnalyticsFilterBar';
import AnalyticsLiveUsersCard from '@/components/shared/analytics/AnalyticsLiveUsersCard';
import SermonAnalyticsHeader from '@/components/shared/analytics/SermonAnalyticsHeader';
import SermonAnalyticsStatsCard from '@/components/shared/analytics/SermonAnalyticsStatsCard';
import { Button } from '@/components/ui/button';
import { analyticsQueryKeys } from '@/constants/analytics-query-keys';
import {
    useAnalyticsBreakdown,
    useAnalyticsOverview,
} from '@/hooks/app/useAnalyticsOverview';
import { useSermonByIdQuery } from '@/hooks/app/useSermon';
import { resolveDateRange } from '@/hooks/app/analytics-overview.util';
import {
    buildSermonScopedOverview,
    mapSermonDocToAnalyticsHeader,
} from '@/utils/sermon-analytics.util';
import { isSermonDetailNotFoundError } from '@/utils/sermon-info-map.util';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import {
    studioSermonEditPath,
    studioSermonsListPath,
} from '@/routes/paths';
import type {
    AnalyticsDateRangePreset,
    AnalyticsGranularity,
} from '@/types/analytics';

interface AnalyticsSermonViewProps {
    studioCode: string;
    sermonId: string;
    /** Rendered inside `SermonEditPage` with sidebar navigation (no page-level back link). */
    embedded?: boolean;
    editPath?: string;
}

export default function AnalyticsSermonView({
    studioCode,
    sermonId,
    embedded = false,
    editPath,
}: AnalyticsSermonViewProps) {
    const queryClient = useQueryClient();

    const [granularity, setGranularity] =
        useState<AnalyticsGranularity>('daily');
    const [dateRange, setDateRange] =
        useState<AnalyticsDateRangePreset>('30d');

    const overviewParams = useMemo(() => {
        const range = resolveDateRange(dateRange);
        return { ...range, granularity };
    }, [dateRange, granularity]);

    const {
        data: sermonDoc,
        isLoading: sermonLoading,
        isError: sermonError,
        error: sermonQueryError,
        refetch: refetchSermon,
    } = useSermonByIdQuery(sermonId, {
        staleTime: 0,
        refetchOnMount: 'always',
    });

    const {
        data: overviewStudio,
        isLoading: overviewLoading,
        isError: overviewError,
        refetch: refetchOverview,
    } = useAnalyticsOverview(studioCode, overviewParams, dateRange);

    const {
        data: breakdown,
        isLoading: breakdownLoading,
        isError: breakdownError,
        refetch: refetchBreakdown,
    } = useAnalyticsBreakdown(studioCode, {
        ...overviewParams,
        dimension: 'sermon',
    });

    const metricsLoading = breakdownLoading || overviewLoading;

    useEffect(() => {
        if (breakdownError || overviewError) {
            toast.error('Could not load sermon analytics.');
        }
    }, [breakdownError, overviewError]);

    useEffect(() => {
        if (
            sermonDoc &&
            typeof sermonDoc === 'object' &&
            typeof (sermonDoc as { title?: string }).title === 'string'
        ) {
            const title = String((sermonDoc as { title: string }).title);
            document.title = title
                ? `${title} — Sermon Analytics`
                : 'Sermon Analytics';
        }
        return () => {
            document.title = 'Sermon Analytics';
        };
    }, [sermonDoc]);

    const breakdownRow = useMemo(() => {
        const rows = breakdown?.rows ?? [];
        return rows.find(
            (r) => r.id === sermonId && r.sermonTitle !== 'No Data',
        );
    }, [breakdown?.rows, sermonId]);

    const playCountFallback = useMemo(() => {
        if (!sermonDoc || typeof sermonDoc !== 'object') {
            return undefined;
        }
        const n = (sermonDoc as { playCount?: number }).playCount;
        return typeof n === 'number' ? n : undefined;
    }, [sermonDoc]);

    const overviewData = useMemo(
        () =>
            buildSermonScopedOverview(
                dateRange,
                breakdownRow,
                playCountFallback,
            ),
        [breakdownRow, dateRange, playCountFallback],
    );

    const showEmptyHint =
        (breakdownRow?.plays ?? playCountFallback ?? 0) === 0;

    const listPath = studioSermonsListPath(studioCode);
    const detailsPath =
        editPath ?? studioSermonEditPath(studioCode, sermonId);

    const handleRefresh = () => {
        void queryClient.invalidateQueries({
            queryKey: analyticsQueryKeys.all,
        });
        void refetchSermon();
        void refetchBreakdown();
        void refetchOverview();
    };

    if (sermonLoading) {
        return (
            <StudioEmptyState placement="region" className="min-h-[40vh]">
                <Loader2
                    className="h-8 w-8 animate-spin text-[#9d9d9d]"
                    aria-hidden
                />
                <p className="font-matter text-sm text-[#9d9d9d]">
                    Loading sermon…
                </p>
            </StudioEmptyState>
        );
    }

    if (sermonError || !sermonDoc || typeof sermonDoc !== 'object') {
        const notFound = isSermonDetailNotFoundError(sermonQueryError);
        return (
            <StudioEmptyState
                placement="region"
                className="min-h-[40vh]"
                wideDescription
                description={
                    notFound
                        ? 'This sermon could not be found. It may have been removed.'
                        : 'Could not load sermon for analytics.'
                }
            >
                {!notFound ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void refetchSermon()}
                    >
                        Retry
                    </Button>
                ) : null}
                <Button type="button" variant="ghost" asChild>
                    <Link to={listPath}>My Sermons</Link>
                </Button>
            </StudioEmptyState>
        );
    }

    const header = mapSermonDocToAnalyticsHeader(
        sermonDoc as Record<string, unknown>,
        sermonId,
    );

    return (
        <div className="space-y-4">
            {!embedded ? (
                <SermonAnalyticsHeader
                    header={header}
                    backTo={listPath}
                    backLabel="Back to My Sermons"
                    editPath={detailsPath}
                />
            ) : null}
            <AnalyticsFilterBar
                granularity={granularity}
                dateRange={dateRange}
                onGranularityChange={setGranularity}
                onDateRangeChange={setDateRange}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <SermonAnalyticsStatsCard
                    data={overviewData}
                    isLoading={metricsLoading}
                    showEmptyHint={showEmptyHint}
                />
                <AnalyticsLiveUsersCard
                    data={overviewStudio}
                    isLoading={metricsLoading}
                    onRefresh={handleRefresh}
                />
            </div>
            <AnalyticsBreakdownSection
                studioCode={studioCode}
                overviewParams={overviewParams}
                focusSermonId={sermonId}
                defaultDimension="region"
            />
            {breakdownError || overviewError ? (
                <div className="flex items-center justify-center gap-3 py-4">
                    <p className="font-matter text-sm text-[#9d9d9d]">
                        Analytics metrics could not be refreshed.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                    >
                        Retry
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
