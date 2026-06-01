import AnalyticsInsightCard from '@/components/shared/analytics/AnalyticsInsightCard';
import AnalyticsLineChart from '@/components/shared/analytics/AnalyticsLineChart';
import { analyticsPanelClass } from '@/components/shared/analytics/analytics-ui';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalyticsOverviewResponse } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface AnalyticsStatsChartCardProps {
    data?: AnalyticsOverviewResponse;
    isLoading?: boolean;
}

export default function AnalyticsStatsChartCard({
    data,
    isLoading = false,
}: AnalyticsStatsChartCardProps) {
    if (isLoading || !data) {
        return (
            <div className={cn(analyticsPanelClass, 'p-4 lg:col-span-2')}>
                <Skeleton className="mb-4 h-6 w-40" />
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Skeleton className="h-[86px]" />
                    <Skeleton className="h-[86px]" />
                    <Skeleton className="h-[86px]" />
                </div>
                <Skeleton className="h-[260px] w-full" />
            </div>
        );
    }

    const { kpis, chart } = data;

    return (
        <div className={cn(analyticsPanelClass, 'p-4 lg:col-span-2')}>
            <h2 className="mb-4 text-base font-medium text-[#eaeaea]">
                Your Sermon Stats
            </h2>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <AnalyticsInsightCard
                    label="Plays"
                    value={kpis.plays.value}
                    deltaPercent={kpis.plays.deltaPercent}
                    compareLabel={
                        kpis.plays.compareFrom
                            ? `From ${kpis.plays.compareFrom}`
                            : undefined
                    }
                    highlighted
                />
                <AnalyticsInsightCard
                    label="Listen time (hrs)"
                    value={kpis.listenTimeHours.value}
                    deltaPercent={kpis.listenTimeHours.deltaPercent}
                    compareLabel={
                        kpis.listenTimeHours.compareFrom
                            ? `From ${kpis.listenTimeHours.compareFrom}`
                            : undefined
                    }
                />
                <AnalyticsInsightCard
                    label="Followers"
                    value={kpis.followers.value}
                    deltaPercent={kpis.followers.deltaPercent}
                    compareLabel={
                        kpis.followers.compareFrom
                            ? `From ${kpis.followers.compareFrom}`
                            : undefined
                    }
                />
            </div>
            <AnalyticsLineChart points={chart} />
        </div>
    );
}
