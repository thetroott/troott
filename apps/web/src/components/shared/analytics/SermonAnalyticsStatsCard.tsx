import AnalyticsInsightCard from '@/components/shared/analytics/AnalyticsInsightCard';
import AnalyticsLineChart from '@/components/shared/analytics/AnalyticsLineChart';
import { analyticsPanelClass } from '@/components/shared/analytics/analytics-ui';
import { Skeleton } from '@/components/ui/skeleton';
import {
    sermonKpisFromOverview,
    type SermonAnalyticsKpiDisplay,
} from '@/utils/sermon-analytics.util';
import type { AnalyticsOverviewResponse } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface SermonAnalyticsStatsCardProps {
    data?: AnalyticsOverviewResponse;
    isLoading?: boolean;
    showEmptyHint?: boolean;
}

export default function SermonAnalyticsStatsCard({
    data,
    isLoading = false,
    showEmptyHint = false,
}: SermonAnalyticsStatsCardProps) {
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

    const kpis: SermonAnalyticsKpiDisplay[] = sermonKpisFromOverview(data);

    return (
        <div className={cn(analyticsPanelClass, 'p-4 lg:col-span-2')}>
            <h2 className="mb-4 text-base font-medium text-[#eaeaea]">
                Performance
            </h2>
            {showEmptyHint ? (
                <p className="mb-4 font-matter text-sm text-[#9d9d9d]">
                    No plays in this period. Metrics update when listeners
                    engage with this sermon.
                </p>
            ) : null}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {kpis.map((kpi) => (
                    <AnalyticsInsightCard
                        key={kpi.label}
                        label={kpi.label}
                        value={kpi.value}
                        deltaPercent={kpi.deltaPercent}
                        compareLabel={kpi.compareLabel}
                        highlighted={kpi.highlighted}
                    />
                ))}
            </div>
            <AnalyticsLineChart points={data.chart} />
        </div>
    );
}
