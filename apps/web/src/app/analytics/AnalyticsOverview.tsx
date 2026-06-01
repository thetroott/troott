import { useEffect } from 'react';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AnalyticsBreakdownSection from '@/components/shared/analytics/AnalyticsBreakdownSection';
import AnalyticsFilterBar from '@/components/shared/analytics/AnalyticsFilterBar';
import AnalyticsLiveUsersCard from '@/components/shared/analytics/AnalyticsLiveUsersCard';
import AnalyticsStatsChartCard from '@/components/shared/analytics/AnalyticsStatsChartCard';
import { analyticsQueryKeys } from '@/constants/analytics-query-keys';
import { useAnalyticsOverview } from '@/hooks/app/useAnalyticsOverview';
import type {
    AnalyticsDateRangePreset,
    AnalyticsGranularity,
    AnalyticsOverviewParams,
} from '@/types/analytics';
import { resolveDateRange } from '@/hooks/app/analytics-overview.util';
import { toast } from 'sonner';

interface AnalyticsOverviewProps {
    studioCode: string;
}

export default function AnalyticsOverview({ studioCode }: AnalyticsOverviewProps) {
    const queryClient = useQueryClient();
    const [granularity, setGranularity] =
        useState<AnalyticsGranularity>('daily');
    const [dateRange, setDateRange] =
        useState<AnalyticsDateRangePreset>('30d');

    const overviewParams: AnalyticsOverviewParams = useMemo(() => {
        const range = resolveDateRange(dateRange);
        return {
            ...range,
            granularity,
        };
    }, [dateRange, granularity]);

    const { data, isLoading, isError, refetch } = useAnalyticsOverview(
        studioCode,
        overviewParams,
        dateRange,
    );

    useEffect(() => {
        if (isError) {
            toast.error('Could not load analytics overview.');
        }
    }, [isError]);

    const handleRefresh = () => {
        void queryClient.invalidateQueries({
            queryKey: analyticsQueryKeys.all,
        });
        void refetch();
    };

    return (
        <div className="space-y-4">
            <AnalyticsFilterBar
                granularity={granularity}
                dateRange={dateRange}
                onGranularityChange={setGranularity}
                onDateRangeChange={setDateRange}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <AnalyticsStatsChartCard data={data} isLoading={isLoading} />
                <AnalyticsLiveUsersCard
                    data={data}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                />
            </div>
            <AnalyticsBreakdownSection
                studioCode={studioCode}
                overviewParams={overviewParams}
            />
        </div>
    );
}
