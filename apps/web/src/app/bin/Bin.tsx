import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowDown,
    ArrowDownUp,
    Filter,
    LayoutGrid,
    List,
    Loader2,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/config';
import storage from '@/api/services/local-storage';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { Button } from '@/components/ui/button';
import { MY_SERMONS_PAGE } from '@/components/shared/my-sermons/my-sermons-ui';
import MySermonsPagination from '@/components/shared/my-sermons/MySermonsPagination';
import BinGridView from '@/components/shared/bin/BinGridView';
import BinListView from '@/components/shared/bin/BinListView';
import {
    BIN_SORT_OPTIONS,
    binSortLabel,
} from '@/components/shared/bin/bin-sort-options';
import { StudioConfirmDialog } from '@/components/shared/studio/StudioConfirmDialog';
import { STUDIO_HEADER_ACTION } from '@/components/shared/studio/studio-header-actions';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import { StudioPageCenter } from '@/components/shared/studio/StudioPageCenter';
import { SermonGetInfoDialog } from '@/components/shared/sermon/SermonGetInfoDialog';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import {
    DEFAULT_MINISTER_LIST_PARAMS,
    MY_SERMONS_PAGE_SIZE,
    sermonQueryKeys,
} from '@/constants/sermon-query-keys';
import {
    useDeleteSermonMutation,
    useRestoreSermonMutation,
} from '@/hooks/app/useSermon';
import {
    mapApiSermonToTableRow,
    parseMinisterSermonsResponse,
} from '@/utils/sermon-list-map.util';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';
import type { MinisterSermonListParams } from '@/constants/sermon-query-keys';
import { studioSermonsListPath } from '@/routes/paths';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Sermon } from '@/_data/dummySermons';
import {
    canStudioUserPermanentlyDeleteSermon,
    SERMON_PUBLISHED_DELETE_POLICY_MESSAGE,
} from '@/utils/sermon-studio-policy.util';

const VIEW_MODE_STORAGE_KEY = 'troott_bin_view_mode';

type PendingConfirm =
    | { kind: 'empty-one'; id: string; title: string }
    | {
          kind: 'empty-batch';
          count: number;
          scope: 'selection' | 'all';
      }
    | null;

const Bin = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creatorId } = useCreator();
    const user = userContext.user as Record<string, unknown> | null;
    const ownerId = useMemo(
        () =>
            resolveStudioSermonOwnerId(user, minister?.id, creatorId),
        [user, minister?.id, creatorId],
    );

    const restoreMutation = useRestoreSermonMutation();
    const deleteMutation = useDeleteSermonMutation();
    const [bulkBusy, setBulkBusy] = useState(false);
    const [confirmSubmitting, setConfirmSubmitting] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
    const [infoTarget, setInfoTarget] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchInput, setSearchInput] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        try {
            const v = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
            return v === 'grid' ? 'grid' : 'list';
        } catch {
            return 'list';
        }
    });
    const [listParams, setListParams] = useState<
        Omit<MinisterSermonListParams, 'status'>
    >({
        page: DEFAULT_MINISTER_LIST_PARAMS.page,
        limit: DEFAULT_MINISTER_LIST_PARAMS.limit,
        sort: DEFAULT_MINISTER_LIST_PARAMS.sort,
        q: '',
        dateFrom: '',
        dateTo: '',
    });

    useEffect(() => {
        const t = window.setTimeout(() => {
            const q = searchInput.trim();
            setListParams((prev) =>
                prev.q === q ? prev : { ...prev, q, page: 1 },
            );
        }, 300);
        return () => window.clearTimeout(t);
    }, [searchInput]);

    const [debouncedQ, setDebouncedQ] = useState(listParams.q ?? '');
    useEffect(() => {
        const q = listParams.q ?? '';
        if (q !== debouncedQ) {
            setDebouncedQ(q);
            setSelectedIds(new Set());
        }
    }, [listParams.q, debouncedQ]);

    useEffect(() => {
        try {
            localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
        } catch {
            /* ignore */
        }
    }, [viewMode]);

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ownerId
            ? sermonQueryKeys.binList(ownerId, listParams)
            : (['sermons', 'bin', 'none'] as const),
        enabled: Boolean(ownerId),
        queryFn: async () => {
            const res = await api.sermon.getSermonsByMinister(ownerId!, {
                page: listParams.page,
                limit: listParams.limit,
                sort: listParams.sort,
                q: listParams.q || undefined,
                dateFrom: listParams.dateFrom || undefined,
                dateTo: listParams.dateTo || undefined,
                status: 'bin',
            });
            const { list, total } = parseMinisterSermonsResponse(res);
            return {
                rows: list.map((doc) => mapApiSermonToTableRow(doc)),
                total,
            };
        },
    });

    const rows: Sermon[] = data?.rows ?? [];
    const totalCount = data?.total ?? 0;
    const allOnPageSelected =
        rows.length > 0 && rows.every((row) => selectedIds.has(row.id));
    const selectedCount = selectedIds.size;
    const sortLabel = binSortLabel(listParams.sort ?? '-updatedAt');

    const hasActiveFilters = Boolean(
        listParams.q?.trim() || listParams.dateFrom || listParams.dateTo,
    );
    const isEmptyBin = totalCount === 0 && !hasActiveFilters;
    const isNoResults = totalCount === 0 && hasActiveFilters;
    const hasRows = rows.length > 0;

    const studioCode = storage.getStudioCode()?.trim() ?? '';
    const mySermonsPath = studioCode
        ? studioSermonsListPath(studioCode)
        : null;

    const filterSummaryParts: string[] = [];
    if (listParams.dateFrom) {
        filterSummaryParts.push(`From ${listParams.dateFrom}`);
    }
    if (listParams.dateTo) {
        filterSummaryParts.push(`To ${listParams.dateTo}`);
    }
    const filterSummary =
        filterSummaryParts.length > 0
            ? filterSummaryParts.join(' · ')
            : 'Filters';

    const invalidateSermonLists = useCallback(async () => {
        if (ownerId) {
            await queryClient.invalidateQueries({
                queryKey: sermonQueryKeys.ministerListRoot(ownerId),
            });
        }
        await refetch();
    }, [ownerId, queryClient, refetch]);

    const restoreOne = useCallback(
        async (id: string) => {
            const res = await restoreMutation.mutateAsync({ id });
            if (res.error) {
                if (!isApiHttp2xxErrorEnvelope(res)) {
                    toast.error(res.message || 'Could not restore sermon.');
                }
                throw new Error(res.message || 'restore failed');
            }
        },
        [restoreMutation],
    );

    const deleteOne = useCallback(
        async (id: string) => {
            const res = await deleteMutation.mutateAsync({ id });
            if (res.error) {
                if (!isApiHttp2xxErrorEnvelope(res)) {
                    toast.error(res.message || 'Could not empty sermon.');
                }
                throw new Error(res.message || 'delete failed');
            }
        },
        [deleteMutation],
    );

    const handleRestoreRow = useCallback(
        async (id: string) => {
            setBulkBusy(true);
            try {
                await restoreOne(id);
                toast.success('Sermon restored to your library.');
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                await invalidateSermonLists();
            } catch (e: unknown) {
                if (
                    !(e instanceof Error) ||
                    e.message !== 'restore failed'
                ) {
                    toast.error(
                        e && typeof e === 'object' && 'message' in e
                            ? String((e as { message: unknown }).message)
                            : 'Could not restore sermon.',
                    );
                }
            } finally {
                setBulkBusy(false);
            }
        },
        [invalidateSermonLists, restoreOne],
    );

    const mutateByIdList = useCallback(
        async (
            ids: string[],
            label: string,
            action: (id: string) => Promise<void>,
        ) => {
            if (!ids.length) {
                toast.message(`No sermons selected to ${label.toLowerCase()}.`);
                return;
            }
            setBulkBusy(true);
            const results = await Promise.allSettled(
                ids.map((id) => action(id)),
            );
            const failed = results.filter((r) => r.status === 'rejected').length;
            const success = results.length - failed;
            if (failed > 0) {
                toast.error(
                    `${label} completed with partial failures: ${success} succeeded, ${failed} failed.`,
                );
            } else {
                toast.success(
                    `${label} completed for ${success} sermon${success === 1 ? '' : 's'}.`,
                );
            }
            setSelectedIds(new Set());
            await invalidateSermonLists();
            setBulkBusy(false);
        },
        [invalidateSermonLists],
    );

    const filterPermanentlyDeletableIds = useCallback(
        (ids: string[]) => {
            const deletable = ids.filter((id) => {
                const row = rows.find((r) => r.id === id);
                if (!row) {
                    return true;
                }
                return canStudioUserPermanentlyDeleteSermon(row);
            });
            if (deletable.length < ids.length) {
                toast.error(SERMON_PUBLISHED_DELETE_POLICY_MESSAGE);
            }
            return deletable;
        },
        [rows],
    );

    const fetchAllBinIdsInScope = useCallback(async () => {
        const ids: string[] = [];
        let page = 1;
        const pageSize = 100;
        while (true) {
            const res = await api.sermon.getSermonsByMinister(ownerId!, {
                page,
                limit: pageSize,
                sort: listParams.sort,
                q: listParams.q || undefined,
                dateFrom: listParams.dateFrom || undefined,
                dateTo: listParams.dateTo || undefined,
                status: 'bin',
            });
            const { list, total } = parseMinisterSermonsResponse(res);
            ids.push(
                ...list
                    .map((doc) => String(doc._id || doc.id || ''))
                    .filter(Boolean),
            );
            if (ids.length >= total || list.length === 0) {
                break;
            }
            page += 1;
        }
        return ids;
    }, [
        listParams.dateFrom,
        listParams.dateTo,
        listParams.q,
        listParams.sort,
        ownerId,
    ]);

    const fetchAllDeletableBinIdsInScope = useCallback(async () => {
        const ids: string[] = [];
        let page = 1;
        const pageSize = 100;
        let fetched = 0;
        let total = 0;
        while (true) {
            const res = await api.sermon.getSermonsByMinister(ownerId!, {
                page,
                limit: pageSize,
                sort: listParams.sort,
                q: listParams.q || undefined,
                dateFrom: listParams.dateFrom || undefined,
                dateTo: listParams.dateTo || undefined,
                status: 'bin',
            });
            const parsed = parseMinisterSermonsResponse(res);
            total = parsed.total;
            const { list } = parsed;
            fetched += list.length;
            for (const doc of list) {
                const row = mapApiSermonToTableRow(doc);
                if (
                    row.id &&
                    canStudioUserPermanentlyDeleteSermon(row)
                ) {
                    ids.push(row.id);
                }
            }
            if (fetched >= total || list.length === 0) {
                break;
            }
            page += 1;
        }
        if (ids.length === 0 && total > 0) {
            toast.error(SERMON_PUBLISHED_DELETE_POLICY_MESSAGE);
        }
        return ids;
    }, [
        listParams.dateFrom,
        listParams.dateTo,
        listParams.q,
        listParams.sort,
        ownerId,
    ]);

    const requestGetInfo = useCallback((id: string) => {
        const row = rows.find((r) => r.id === id);
        setInfoTarget({
            id,
            title: row?.name?.trim() || 'Untitled sermon',
        });
    }, [rows]);

    const requestEmptyOne = useCallback(
        (id: string) => {
            const row = rows.find((r) => r.id === id);
            if (row && !canStudioUserPermanentlyDeleteSermon(row)) {
                toast.error(SERMON_PUBLISHED_DELETE_POLICY_MESSAGE);
                return;
            }
            setPendingConfirm({
                kind: 'empty-one',
                id,
                title: row?.name?.trim() || 'this sermon',
            });
        },
        [rows],
    );

    const requestEmptyBinAction = useCallback(() => {
        if (selectedCount > 0) {
            setPendingConfirm({
                kind: 'empty-batch',
                scope: 'selection',
                count: selectedCount,
            });
            return;
        }
        setPendingConfirm({
            kind: 'empty-batch',
            scope: 'all',
            count: totalCount,
        });
    }, [selectedCount, totalCount]);

    const runPendingConfirm = useCallback(async () => {
        if (!pendingConfirm) {
            return;
        }
        setConfirmSubmitting(true);
        try {
            if (pendingConfirm.kind === 'empty-one') {
                await deleteOne(pendingConfirm.id);
                toast.success('Sermon removed permanently.');
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(pendingConfirm.id);
                    return next;
                });
                await invalidateSermonLists();
                setPendingConfirm(null);
            } else if (pendingConfirm.kind === 'empty-batch') {
                const rawIds =
                    pendingConfirm.scope === 'selection'
                        ? Array.from(selectedIds)
                        : await fetchAllDeletableBinIdsInScope();
                const ids =
                    pendingConfirm.scope === 'selection'
                        ? filterPermanentlyDeletableIds(rawIds)
                        : rawIds;
                if (!ids.length) {
                    setPendingConfirm(null);
                    return;
                }
                await mutateByIdList(ids, 'Empty bin', deleteOne);
                setPendingConfirm(null);
            }
        } catch {
            /* deleteOne / mutateByIdList surface toasts; keep dialog open */
        } finally {
            setConfirmSubmitting(false);
        }
    }, [
        deleteOne,
        fetchAllDeletableBinIdsInScope,
        filterPermanentlyDeletableIds,
        invalidateSermonLists,
        mutateByIdList,
        pendingConfirm,
        selectedIds,
    ]);

    const handleRestoreAction = useCallback(async () => {
        const ids =
            selectedCount > 0
                ? Array.from(selectedIds)
                : await fetchAllBinIdsInScope();
        await mutateByIdList(ids, 'Restore', restoreOne);
    }, [
        fetchAllBinIdsInScope,
        mutateByIdList,
        restoreOne,
        selectedCount,
        selectedIds,
    ]);

    const binActionsDisabled =
        bulkBusy || confirmSubmitting || totalCount === 0;

    const setPage = useCallback((page: number) => {
        setListParams((prev) => ({ ...prev, page }));
    }, []);

    const setSort = useCallback((sort: string) => {
        setListParams((prev) => ({ ...prev, sort, page: 1 }));
        setSelectedIds(new Set());
    }, []);

    const setDateFrom = useCallback((dateFrom: string) => {
        setListParams((prev) => ({ ...prev, dateFrom, page: 1 }));
        setSelectedIds(new Set());
    }, []);

    const setDateTo = useCallback((dateTo: string) => {
        setListParams((prev) => ({ ...prev, dateTo, page: 1 }));
        setSelectedIds(new Set());
    }, []);

    const clearDateFilters = useCallback(() => {
        setDateFrom('');
        setDateTo('');
    }, [setDateFrom, setDateTo]);

    const handleSelectAll = useCallback(() => {
        const next = new Set(selectedIds);
        if (allOnPageSelected) {
            rows.forEach((row) => next.delete(row.id));
        } else {
            rows.forEach((row) => next.add(row.id));
        }
        setSelectedIds(next);
    }, [allOnPageSelected, rows, selectedIds]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleDateCreatedHeaderClick = useCallback(() => {
        setListParams((prev) => ({
            ...prev,
            sort: prev.sort === '-createdAt' ? 'createdAt' : '-createdAt',
            page: 1,
        }));
        setSelectedIds(new Set());
    }, []);

    const confirmDialogProps = useMemo(() => {
        if (!pendingConfirm) {
            return null;
        }
        if (pendingConfirm.kind === 'empty-one') {
            return {
                title: 'Empty immediately',
                description: (
                    <>
                        You&apos;re about to permanently remove{' '}
                        <strong>{pendingConfirm.title}</strong>. This cannot be
                        undone.
                    </>
                ),
                confirmLabel: 'Empty immediately',
            };
        }
        const { count, scope } = pendingConfirm;
        return {
            title: 'Empty bin',
            description: (
                <>
                    Permanently remove{' '}
                    <strong>{count}</strong>{' '}
                    sermon{count === 1 ? '' : 's'}
                    {scope === 'selection'
                        ? ' (selected)'
                        : ' in the bin (matching your current filters)'}
                    ? This cannot be undone.
                </>
            ),
            confirmLabel: 'Empty bin',
        };
    }, [pendingConfirm]);

    if (!ownerId) {
        return (
            <StudioPageCenter>
                <StudioEmptyState
                    placement="page"
                    wideDescription
                    description="Your account is not linked to a studio profile, so the bin cannot be loaded."
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
                        Loading bin…
                    </p>
                </StudioEmptyState>
            </StudioPageCenter>
        );
    }

    if (isError) {
        const message =
            error && typeof error === 'object' && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Could not load bin.';
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
                        onClick={() => void refetch()}
                    >
                        Retry
                    </Button>
                </StudioEmptyState>
            </StudioPageCenter>
        );
    }

    return (
        <div className={cn(MY_SERMONS_PAGE.pageBg, MY_SERMONS_PAGE.pageRoot)}>
            <div className={MY_SERMONS_PAGE.mainColumn}>
                <header className="flex items-center justify-between gap-4 border-b border-[#545454]/50 pb-4">
                    <div className="flex min-w-0 items-center gap-2">
                        <h1 className="text-base font-medium text-[#eaeaea]">
                            Bin
                        </h1>
                        {isFetching ? (
                            <span className="sr-only">Updating bin</span>
                        ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={binActionsDisabled}
                            className={STUDIO_HEADER_ACTION.outline}
                            title={
                                selectedCount > 0
                                    ? `Restore ${selectedCount} selected sermon${selectedCount === 1 ? '' : 's'}`
                                    : 'Restore all sermons in the bin (current filters)'
                            }
                            onClick={() => void handleRestoreAction()}
                        >
                            <RotateCcw className="size-4" aria-hidden />
                            Restore
                        </Button>
                        <Button
                            type="button"
                            disabled={binActionsDisabled}
                            className={STUDIO_HEADER_ACTION.primary}
                            title={
                                selectedCount > 0
                                    ? `Permanently remove ${selectedCount} selected sermon${selectedCount === 1 ? '' : 's'}`
                                    : 'Permanently remove all sermons in the bin (current filters)'
                            }
                            onClick={requestEmptyBinAction}
                        >
                            <Trash2 className="size-4" aria-hidden />
                            Empty bin
                        </Button>
                    </div>
                </header>

                <div className={MY_SERMONS_PAGE.chromeStack}>
                    <div className={MY_SERMONS_PAGE.toolbarRow}>
                        <div
                            className={cn(
                                MY_SERMONS_PAGE.toolbarLeft,
                                'flex-wrap',
                            )}
                        >
                            <div className={MY_SERMONS_PAGE.searchWrap}>
                                <Search
                                    className={MY_SERMONS_PAGE.searchIcon}
                                    aria-hidden
                                />
                                <input
                                    type="search"
                                    placeholder="Search bin sermons"
                                    className={MY_SERMONS_PAGE.searchInput}
                                    aria-label="Search bin sermons"
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={MY_SERMONS_PAGE.pillBtn}
                                    >
                                        <Filter
                                            className={
                                                MY_SERMONS_PAGE.pillBtnIcon
                                            }
                                            aria-hidden
                                        />
                                        <span className="max-w-[140px] truncate">
                                            {filterSummary}
                                        </span>
                                        <ArrowDown
                                            className={
                                                MY_SERMONS_PAGE.pillBtnIcon
                                            }
                                            aria-hidden
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-64"
                                >
                                    <DropdownMenuLabel>
                                        Date created
                                    </DropdownMenuLabel>
                                    <div className="flex flex-col gap-2 px-2 py-1.5">
                                        <label className="text-xs text-muted-foreground">
                                            From
                                            <Input
                                                type="date"
                                                className="mt-1 h-8"
                                                value={listParams.dateFrom}
                                                onChange={(e) =>
                                                    setDateFrom(e.target.value)
                                                }
                                            />
                                        </label>
                                        <label className="text-xs text-muted-foreground">
                                            To
                                            <Input
                                                type="date"
                                                className="mt-1 h-8"
                                                value={listParams.dateTo}
                                                onChange={(e) =>
                                                    setDateTo(e.target.value)
                                                }
                                            />
                                        </label>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={clearDateFilters}
                                    >
                                        Clear date filters
                                    </Button>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <span className="hidden text-xs text-[#9d9d9d] sm:inline">
                                {selectedCount > 0
                                    ? `${selectedCount} selected`
                                    : `${totalCount} total`}
                            </span>
                        </div>

                        <div className={MY_SERMONS_PAGE.toolbarRight}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={MY_SERMONS_PAGE.pillBtn}
                                    >
                                        <ArrowDownUp
                                            className={
                                                MY_SERMONS_PAGE.pillBtnIcon
                                            }
                                            aria-hidden
                                        />
                                        <span className="max-w-[160px] truncate">
                                            {sortLabel}
                                        </span>
                                        <ArrowDown
                                            className={
                                                MY_SERMONS_PAGE.pillBtnIcon
                                            }
                                            aria-hidden
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <DropdownMenuRadioGroup
                                        value={
                                            BIN_SORT_OPTIONS.some(
                                                (o) =>
                                                    o.value === listParams.sort,
                                            )
                                                ? listParams.sort
                                                : '-updatedAt'
                                        }
                                        onValueChange={setSort}
                                    >
                                        {BIN_SORT_OPTIONS.map((opt) => (
                                            <DropdownMenuRadioItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div
                                className={MY_SERMONS_PAGE.viewToggle}
                                role="group"
                                aria-label="View mode"
                            >
                                <button
                                    type="button"
                                    aria-pressed={viewMode === 'grid'}
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        MY_SERMONS_PAGE.viewToggleBtn,
                                        viewMode === 'grid'
                                            ? MY_SERMONS_PAGE.viewToggleBtnActive
                                            : MY_SERMONS_PAGE.viewToggleBtnIdle,
                                    )}
                                >
                                    <LayoutGrid
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                    />
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={viewMode === 'list'}
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        MY_SERMONS_PAGE.viewToggleBtn,
                                        viewMode === 'list'
                                            ? MY_SERMONS_PAGE.viewToggleBtnActive
                                            : MY_SERMONS_PAGE.viewToggleBtnIdle,
                                    )}
                                >
                                    <List className="h-4 w-4" strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={MY_SERMONS_PAGE.contentStack}>
                    {isEmptyBin ? (
                        <StudioEmptyState
                            placement="region"
                            title="Bin is empty"
                            description="Sermons you move to trash from My Sermons appear here. You can restore them or empty them permanently."
                        >
                            {mySermonsPath ? (
                                <Button type="button" variant="outline" asChild>
                                    <Link to={mySermonsPath}>
                                        Go to My Sermons
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                >
                                    Go back
                                </Button>
                            )}
                        </StudioEmptyState>
                    ) : isNoResults ? (
                        <StudioEmptyState
                            placement="region"
                            title="Nothing here"
                            description="No sermons in the bin match your filters. Try adjusting search or filters."
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setSearchInput('');
                                    clearDateFilters();
                                }}
                            >
                                Clear filters
                            </Button>
                        </StudioEmptyState>
                    ) : hasRows ? (
                        <div className={MY_SERMONS_PAGE.contentWithFooter}>
                            <div className={MY_SERMONS_PAGE.contentScroll}>
                                {viewMode === 'grid' ? (
                                    <BinGridView
                                        sermons={rows}
                                        selectedSermons={selectedIds}
                                        onSermonSelect={toggleSelect}
                                        onGetInfo={requestGetInfo}
                                        onRestore={(id) =>
                                            void handleRestoreRow(id)
                                        }
                                        onEmptyImmediately={requestEmptyOne}
                                    />
                                ) : (
                                    <BinListView
                                        sermons={rows}
                                        selectedSermons={selectedIds}
                                        selectAll={allOnPageSelected}
                                        onSelectAll={handleSelectAll}
                                        onSermonSelect={toggleSelect}
                                        onGetInfo={requestGetInfo}
                                        onRestore={(id) =>
                                            void handleRestoreRow(id)
                                        }
                                        onEmptyImmediately={requestEmptyOne}
                                        sortKey={listParams.sort}
                                        onDateCreatedSortClick={
                                            handleDateCreatedHeaderClick
                                        }
                                    />
                                )}
                            </div>
                            <MySermonsPagination
                                page={listParams.page}
                                pageSize={MY_SERMONS_PAGE_SIZE}
                                total={totalCount}
                                onPageChange={setPage}
                            />
                        </div>
                    ) : null}
                </div>
            </div>

            <SermonGetInfoDialog
                sermonId={infoTarget?.id ?? null}
                open={infoTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setInfoTarget(null);
                    }
                }}
                context="bin"
                initialTitle={infoTarget?.title}
            />

            {confirmDialogProps ? (
                <StudioConfirmDialog
                    open={pendingConfirm !== null}
                    onOpenChange={(open) => {
                        if (!open && !confirmSubmitting) {
                            setPendingConfirm(null);
                        }
                    }}
                    title={confirmDialogProps.title}
                    description={confirmDialogProps.description}
                    confirmLabel={confirmDialogProps.confirmLabel}
                    confirmTone="destructive"
                    confirming={confirmSubmitting}
                    onConfirm={runPendingConfirm}
                />
            ) : null}
        </div>
    );
};

export default Bin;
