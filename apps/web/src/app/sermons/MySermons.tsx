import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import EmptySermonsState from '@/components/shared/my-sermons/EmptySermonsState';
import SermonsTable from '@/components/shared/my-sermons/SermonsTable';
import api from '@/api/config';
import useContextType from '@/hooks/shared/useContextType';
import { resolveMinisterId } from '@/utils/minister-id.util';
import {
    DEFAULT_MINISTER_LIST_PARAMS,
    MY_SERMONS_PAGE_SIZE,
    sermonQueryKeys,
    type MinisterSermonListParams,
} from '@/constants/sermon-query-keys';
import {
    mapApiSermonToTableRow,
    parseMinisterSermonsResponse,
} from '@/utils/sermon-list-map.util';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Sermons = () => {
    const { userContext } = useContextType();
    const user = userContext.user as Record<string, unknown> | null;
    const ministerId = useMemo(() => resolveMinisterId(user), [user]);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [listParams, setListParams] = useState<
        Omit<MinisterSermonListParams, 'q'>
    >({
        page: DEFAULT_MINISTER_LIST_PARAMS.page,
        limit: DEFAULT_MINISTER_LIST_PARAMS.limit,
        sort: DEFAULT_MINISTER_LIST_PARAMS.sort,
        status: DEFAULT_MINISTER_LIST_PARAMS.status,
        dateFrom: DEFAULT_MINISTER_LIST_PARAMS.dateFrom,
        dateTo: DEFAULT_MINISTER_LIST_PARAMS.dateTo,
    });

    const listParamsWithQ: MinisterSermonListParams = useMemo(
        () => ({
            ...listParams,
            q: debouncedSearch,
        }),
        [listParams, debouncedSearch],
    );

    useEffect(() => {
        const t = window.setTimeout(
            () => setDebouncedSearch(searchInput.trim()),
            300,
        );
        return () => window.clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setListParams((p) => (p.page === 1 ? p : { ...p, page: 1 }));
    }, [debouncedSearch]);

    const listQueryKey = useMemo(
        () =>
            ministerId
                ? sermonQueryKeys.ministerList(ministerId, listParamsWithQ)
                : (['sermons', 'minister', 'none'] as const),
        [ministerId, listParamsWithQ],
    );

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: listQueryKey,
        enabled: Boolean(ministerId),
        queryFn: async () => {
            const res = await api.sermon.getSermonsByMinister(
                ministerId!,
                {
                    page: listParamsWithQ.page,
                    limit: listParamsWithQ.limit,
                    sort: listParamsWithQ.sort,
                    q: listParamsWithQ.q || undefined,
                    status:
                        listParamsWithQ.status === 'all'
                            ? undefined
                            : listParamsWithQ.status,
                    dateFrom: listParamsWithQ.dateFrom || undefined,
                    dateTo: listParamsWithQ.dateTo || undefined,
                },
            );
            const { list, total } = parseMinisterSermonsResponse(res);
            return { rows: list, total };
        },
    });

    const sermons = useMemo(() => {
        const rows = data?.rows ?? [];
        if (!rows.length) return [];
        return rows.map((doc) => mapApiSermonToTableRow(doc));
    }, [data?.rows]);

    const totalCount = data?.total ?? 0;

    const setPage = useCallback((p: number) => {
        setListParams((prev) => ({ ...prev, page: p }));
    }, []);

    const setSort = useCallback((sort: string) => {
        setListParams((prev) => ({ ...prev, sort, page: 1 }));
    }, []);

    const setStatus = useCallback(
        (status: MinisterSermonListParams['status']) => {
            setListParams((prev) => ({ ...prev, status, page: 1 }));
        },
        [],
    );

    const setDateFrom = useCallback((dateFrom: string) => {
        setListParams((prev) => ({ ...prev, dateFrom, page: 1 }));
    }, []);

    const setDateTo = useCallback((dateTo: string) => {
        setListParams((prev) => ({ ...prev, dateTo, page: 1 }));
    }, []);

    if (!ministerId) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <p className="text-muted-foreground max-w-md">
                    Your account is not linked to a minister profile yet, so
                    sermon lists cannot be loaded. Upload and publish still work
                    from Create sermon.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                <p>Loading sermons…</p>
            </div>
        );
    }

    if (isError) {
        const message =
            error && typeof error === 'object' && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Could not load sermons.';
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
                <p className="text-destructive">{message}</p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => refetch()}
                >
                    Retry
                </Button>
            </div>
        );
    }

    const hasListFilters =
        Boolean(debouncedSearch) ||
        listParams.status !== 'all' ||
        Boolean(listParams.dateFrom) ||
        Boolean(listParams.dateTo);

    if (!sermons.length && !hasListFilters) {
        return <EmptySermonsState />;
    }

    return (
        <SermonsTable
            listMode="remote"
            ministerId={ministerId}
            sermons={sermons}
            totalCount={totalCount}
            page={listParams.page}
            pageSize={MY_SERMONS_PAGE_SIZE}
            onPageChange={setPage}
            search={searchInput}
            onSearchChange={setSearchInput}
            sort={listParams.sort}
            onSortChange={setSort}
            status={listParams.status}
            onStatusChange={setStatus}
            dateFrom={listParams.dateFrom}
            dateTo={listParams.dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            isFetching={isFetching}
        />
    );
};

export default Sermons;
