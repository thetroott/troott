import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AnalyticsOverview from '@/app/analytics/AnalyticsOverview';
import AnalyticsTabPlaceholder from '@/app/analytics/AnalyticsTabPlaceholder';
import AnalyticsSermonEmpty from '@/components/shared/analytics/AnalyticsSermonEmpty';
import AnalyticsPageHeader from '@/components/shared/analytics/AnalyticsPageHeader';
import AnalyticsPrimaryTabs from '@/components/shared/analytics/AnalyticsPrimaryTabs';
import { MY_SERMONS_PAGE } from '@/components/shared/my-sermons/my-sermons-ui';
import { cn } from '@/lib/utils';
import { analyticsQueryKeys } from '@/constants/analytics-query-keys';
import {
    studioSermonAnalyticsPath,
    studioSermonsListPath,
} from '@/routes/paths';
import type { AnalyticsPrimaryTab } from '@/types/analytics';

function parseTab(value: string | null): AnalyticsPrimaryTab {
    if (value === 'sermon' || value === 'series') {
        return value;
    }
    return 'overview';
}

export default function Analytics() {
    const { studioCode } = useParams<{ studioCode: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const tab = parseTab(searchParams.get('tab'));
    const sermonId = searchParams.get('sermonId')?.trim() ?? '';
    const code = studioCode?.trim() ?? '';

    useEffect(() => {
        if (sermonId && code && (tab === 'overview' || tab === 'sermon')) {
            navigate(studioSermonAnalyticsPath(code, sermonId), {
                replace: true,
            });
        }
    }, [code, navigate, sermonId, tab]);

    const handleTabChange = useCallback(
        (next: AnalyticsPrimaryTab) => {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set('tab', next);
                if (next !== 'sermon') {
                    params.delete('sermonId');
                }
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

    const effectiveTab =
        tab === 'overview' && sermonId ? 'sermon' : tab;

    const tabContent = useMemo(() => {
        if (!code) {
            return null;
        }
        if (effectiveTab === 'overview') {
            return <AnalyticsOverview studioCode={code} />;
        }
        if (effectiveTab === 'sermon') {
            if (!sermonId) {
                return (
                    <AnalyticsSermonEmpty
                        sermonsListPath={studioSermonsListPath(code)}
                    />
                );
            }
            return null;
        }
        return (
            <AnalyticsTabPlaceholder message="Series analytics — coming soon." />
        );
    }, [code, effectiveTab, sermonId]);

    return (
        <div
            className={cn(
                MY_SERMONS_PAGE.pageBg,
                MY_SERMONS_PAGE.pageRoot,
            )}
        >
            <div className={MY_SERMONS_PAGE.mainColumn}>
                <AnalyticsPageHeader onRefresh={handleRefresh} />
                <div className="mt-2">
                    <AnalyticsPrimaryTabs
                        value={effectiveTab}
                        onValueChange={handleTabChange}
                    />
                </div>
                <div className="mt-2 min-h-0 flex-1">{tabContent}</div>
            </div>
        </div>
    );
}
