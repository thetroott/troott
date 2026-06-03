import { useQuery } from '@tanstack/react-query';
import api from '@/api/config';
import { useStudio } from '@/context/studio/useStudio';
import type { ProfileInsightStats } from '@/app/profile/profile.types';
import { parseMinisterSermonsResponse } from '@/utils/sermon-list-map.util';
import type { IAPIResponse } from '@/api/types';

export const profileStatsQueryKeys = {
    publishedCount: (ministerId: string) =>
        ['profile', 'stats', 'published-count', ministerId] as const,
};

async function fetchPublishedSermonCount(
    ministerId: string,
): Promise<number | undefined> {
    const res = await api.sermon.getSermonsByMinister(ministerId, {
        page: 1,
        limit: 1,
        sort: '-releaseDate',
        status: 'published',
    } as Parameters<typeof api.sermon.getSermonsByMinister>[1]);
    if (res.error) {
        return undefined;
    }
    const { total } = parseMinisterSermonsResponse(res as IAPIResponse);
    return total;
}

/**
 * Insight card metrics for `/profile` (feat-0024).
 * - Sermons published: minister sermon list `total` (published filter)
 * - Total listens / followers: studio aggregate when loaded
 */
export function useProfileInsightStats(ministerId: string | undefined) {
    const { studio } = useStudio();

    const publishedQuery = useQuery({
        queryKey: profileStatsQueryKeys.publishedCount(ministerId ?? ''),
        queryFn: () => fetchPublishedSermonCount(ministerId!),
        enabled: Boolean(ministerId),
        staleTime: 60_000,
    });

    const stats: ProfileInsightStats = {
        sermonsPublished:
            publishedQuery.data ??
            (typeof studio?.totalSermons === 'number'
                ? studio.totalSermons
                : undefined),
        totalListens:
            typeof studio?.totalListeners === 'number'
                ? studio.totalListeners
                : typeof studio?.totalPlays === 'number'
                  ? studio.totalPlays
                  : undefined,
        followers:
            typeof studio?.followers === 'number'
                ? studio.followers
                : undefined,
    };

    return {
        stats,
        isLoading: publishedQuery.isLoading,
    };
}
