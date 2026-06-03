import { useMinisterSermonsQuery } from '@/hooks/app/useSermon';
import { mapApiSermonToTableRow } from '@/utils/sermon-list-map.util';
import type { Sermon } from '@/_data/dummySermons';

export type ProfileRecentSermonRow = Pick<
    Sermon,
    'id' | 'name' | 'plays' | 'releaseDateMs'
>;

const RECENT_PARAMS = {
    page: 1,
    limit: 3,
    sort: '-releaseDate',
    q: '',
    status: 'published' as const,
    dateFrom: '',
    dateTo: '',
};

/** Top 3 published sermons for profile Recent Sermons column (feat-0024). */
export function useProfileRecentSermons(ministerId: string | undefined) {
    const query = useMinisterSermonsQuery(ministerId, RECENT_PARAMS, {
        enabled: Boolean(ministerId),
        staleTime: 60_000,
    });

    const rows: ProfileRecentSermonRow[] = (query.data ?? []).map((raw) => {
        const row = mapApiSermonToTableRow(raw);
        return {
            id: row.id,
            name: row.name,
            plays: row.plays,
            releaseDateMs: row.releaseDateMs,
        };
    });

    return {
        rows,
        isLoading: query.isLoading,
        isError: query.isError,
        total: rows.length,
    };
}
