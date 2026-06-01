import { useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AnalyticsOverview from '@/app/analytics/AnalyticsOverview';
import AnalyticsTabPlaceholder from '@/app/analytics/AnalyticsTabPlaceholder';
import AnalyticsPageHeader from '@/components/shared/analytics/AnalyticsPageHeader';
import AnalyticsPrimaryTabs from '@/components/shared/analytics/AnalyticsPrimaryTabs';
import { analyticsQueryKeys } from '@/constants/analytics-query-keys';
import type { AnalyticsPrimaryTab } from '@/types/analytics';

function parseTab(value: string | null): AnalyticsPrimaryTab {
    if (value === 'sermon' || value === 'series') {
        return value;
    }
    return 'overview';
}

export default function Analytics() {
    const { studioCode } = useParams<{ studioCode: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const tab = parseTab(searchParams.get('tab'));
    const code = studioCode?.trim() ?? '';

    const handleTabChange = useCallback(
        (next: AnalyticsPrimaryTab) => {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set('tab', next);
                return params;
            });
        },
        [setSearchParams],
    );

    const handleRefresh = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: analyticsQueryKeys.all,
        });
    }, [queryClient]);

    const tabContent = useMemo(() => {
        if (!code) {
            return null;
        }
        if (tab === 'overview') {
            return <AnalyticsOverview studioCode={code} />;
        }
        if (tab === 'sermon') {
            return (
                <AnalyticsTabPlaceholder message="Sermon-level analytics — coming soon." />
            );
        }
        return (
            <AnalyticsTabPlaceholder message="Series analytics — coming soon." />
        );
    }, [code, tab]);

    return (
        <div className="mx-auto w-full max-w-[1200px] px-6 py-6">
            <AnalyticsPageHeader onRefresh={handleRefresh} />
            <div className="mt-2">
                <AnalyticsPrimaryTabs value={tab} onValueChange={handleTabChange} />
            </div>
            <div className="mt-2">{tabContent}</div>
        </div>
    );
}
