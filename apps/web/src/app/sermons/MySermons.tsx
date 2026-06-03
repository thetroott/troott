import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SermonsTable from '@/components/shared/my-sermons/SermonsTable';
import api from '@/api/config';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';
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
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import { StudioPageCenter } from '@/components/shared/studio/StudioPageCenter';
import { Loader2 } from 'lucide-react';

const Sermons = () => {
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creatorId } = useCreator();
    const user = userContext.user as Record<string, unknown> | null;
    const ministerId = useMemo(
        () => resolveStudioSermonOwnerId(user, minister?.id, creatorId),
        [user, minister?.id, creatorId],
    );

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
            <StudioPageCenter>
                <StudioEmptyState
                    placement="page"
                    wideDescription
                    description="Your account is not linked to a minister or creator profile yet, so sermon lists cannot be loaded. Upload and publish still work from Create sermon."
                />
            </StudioPageCenter>
        );
    }

    if (isLoading) {
        return (
            <StudioPageCenter>
                <StudioEmptyState placement="page">
                    <Loader2
                        className="h-8 w-8 animate-spin text-[#9d9d9d]"
                        aria-hidden
                    />
                    <p className="font-matter text-sm text-[#9d9d9d]">
                        Loading sermons…
                    </p>
                </StudioEmptyState>
            </StudioPageCenter>
        );
    }

    if (isError) {
        const message =
            error && typeof error === 'object' && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Could not load sermons.';
        return (
            <StudioPageCenter>
                <StudioEmptyState
                    placement="page"
                    description={
                        <span className="text-destructive">{message}</span>
                    }
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => refetch()}
                    >
                        Retry
                    </Button>
                </StudioEmptyState>
            </StudioPageCenter>
        );
    }

    const hasListFilters =
        Boolean(debouncedSearch) ||
        listParams.status !== 'all' ||
        Boolean(listParams.dateFrom) ||
        Boolean(listParams.dateTo);

    if (!sermons.length && !hasListFilters) {
        return (
            <SermonsTable
                listMode="remote"
                ministerId={ministerId}
                sermons={[]}
                totalCount={0}
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
