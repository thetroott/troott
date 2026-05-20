import type { Sermon } from '@/_data/dummySermons';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { toast } from 'sonner';
import { useUpload } from '@/context/upload/uploadState';
import UploadEntryStepModal from '@/components/shared/upload/UploadEntryStepModal';
import { applySelectedAudioToUpload } from '@/utils/upload-audio-selection.util';
import {
    ArrowDown,
    ArrowUp,
    Filter,
    LayoutGrid,
    List,
    Plus,
    Search,
    ArrowDownUp,
} from 'lucide-react';
import SermonsGridView from './SermonsGridView';
import SermonsListView from './SermonsListView';
import MySermonsPagination from './MySermonsPagination';
import {
    MY_SERMONS_PAGE,
    SermonTitleMicGlyph,
} from '@/components/shared/my-sermons/my-sermons-ui';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sermonQueryKeys } from '@/constants/sermon-query-keys';
import {
    fetchSermonDetail,
    useMoveSermonToBinMutation,
    useUpdateSermonMutation,
} from '@/hooks/app/useSermon';
import type { MinisterSermonListParams } from '@/constants/sermon-query-keys';
export type { Sermon };

const VIEW_MODE_STORAGE_KEY = 'troott_my_sermons_view_mode';

const SORT_OPTIONS: { value: string; label: string }[] = [
    { value: '-updatedAt', label: 'Recently updated' },
    { value: '-createdAt', label: 'Date created (newest)' },
    { value: 'createdAt', label: 'Date created (oldest)' },
    { value: '-releaseDate', label: 'Release date (newest)' },
    { value: 'title', label: 'Title A–Z' },
    { value: '-title', label: 'Title Z–A' },
];

interface SermonsTableProps {
    /** When `remote`, toolbar state is owned by the parent + server (My Sermons). Default `local` for demos that only pass `sermons`. */
    listMode?: 'remote' | 'local';
    ministerId?: string | null;
    sermons: Sermon[];
    totalCount?: number;
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    search?: string;
    onSearchChange?: (value: string) => void;
    sort?: string;
    onSortChange?: (sort: string) => void;
    status?: MinisterSermonListParams['status'];
    onStatusChange?: (status: MinisterSermonListParams['status']) => void;
    dateFrom?: string;
    dateTo?: string;
    onDateFromChange?: (v: string) => void;
    onDateToChange?: (v: string) => void;
    isFetching?: boolean;
}

type MainTab = 'Sermon' | 'Series' | 'Playlists';

const MAIN_TABS: MainTab[] = ['Sermon', 'Series', 'Playlists'];

const DEFAULT_PAGE_SIZE = 16;

function clientFilterSermons(
    rows: Sermon[],
    q: string,
    status: MinisterSermonListParams['status'],
): Sermon[] {
    let out = rows;
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length) {
        out = out.filter((s) => {
            const hay = s.name.toLowerCase();
            return terms.every((t) => hay.includes(t));
        });
    }
    if (status === 'draft') {
        out = out.filter((s) => s.publicationStatus === 'draft');
    } else if (status === 'published') {
        out = out.filter((s) => s.publicationStatus === 'published');
    }
    return out;
}

function clientSortSermons(rows: Sermon[], sort: string): Sermon[] {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    const dir = desc ? -1 : 1;
    return [...rows].sort((a, b) => {
        if (field === 'title' || field === 'name') {
            const cmp = a.name.localeCompare(b.name);
            return cmp * dir;
        }
        if (field === 'plays') {
            return (a.plays - b.plays) * dir;
        }
        if (field === 'createdAt') {
            const ca = a.createdAtMs ?? 0;
            const cb = b.createdAtMs ?? 0;
            return (ca - cb) * dir;
        }
        if (field === 'updatedAt') {
            const ua = a.updatedAtMs ?? a.createdAtMs ?? 0;
            const ub = b.updatedAtMs ?? b.createdAtMs ?? 0;
            return (ua - ub) * dir;
        }
        if (field === 'releaseDate') {
            const ra = a.releaseDateMs ?? a.createdAtMs ?? 0;
            const rb = b.releaseDateMs ?? b.createdAtMs ?? 0;
            return (ra - rb) * dir;
        }
        return 0;
    });
}

const SermonsTable = ({
    listMode = 'local',
    ministerId = null,
    sermons,
    totalCount: totalCountProp,
    page: pageProp,
    pageSize: pageSizeProp,
    onPageChange,
    search: searchProp,
    onSearchChange,
    sort: sortProp,
    onSortChange,
    status: statusProp,
    onStatusChange,
    dateFrom: dateFromProp,
    dateTo: dateToProp,
    onDateFromChange,
    onDateToChange,
    isFetching = false,
}: SermonsTableProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const updateSermonMutation = useUpdateSermonMutation();
    const moveSermonToBinMutation = useMoveSermonToBinMutation();
    const { dispatch, state: uploadState } = useUpload();
    const [entryModalOpen, setEntryModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<MainTab>('Sermon');
    const [selectedSermons, setSelectedSermons] = useState<Set<string>>(
        new Set(),
    );
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        try {
            const v = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
            return v === 'grid' ? 'grid' : 'list';
        } catch {
            return 'list';
        }
    });

    const controlled = listMode === 'remote';

    const [localPage, setLocalPage] = useState(1);
    const [localSearch, setLocalSearch] = useState('');
    const [debouncedLocalSearch, setDebouncedLocalSearch] = useState('');
    const [localSort, setLocalSort] = useState('-updatedAt');
    const [localStatus, setLocalStatus] =
        useState<MinisterSermonListParams['status']>('all');

    useEffect(() => {
        const t = window.setTimeout(
            () => setDebouncedLocalSearch(localSearch.trim()),
            300,
        );
        return () => window.clearTimeout(t);
    }, [localSearch]);

    useEffect(() => {
        try {
            localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
        } catch {
            /* ignore */
        }
    }, [viewMode]);

    const page = controlled ? pageProp! : localPage;
    const pageSize = pageSizeProp ?? DEFAULT_PAGE_SIZE;
    const search = controlled ? (searchProp ?? '') : localSearch;
    const setSearch = controlled ? onSearchChange! : setLocalSearch;
    const sort = controlled ? (sortProp ?? '-updatedAt') : localSort;
    const setSort = controlled ? onSortChange! : setLocalSort;
    const status = controlled ? (statusProp ?? 'all') : localStatus;
    const setStatus = controlled ? onStatusChange! : setLocalStatus;
    const dateFrom = controlled ? (dateFromProp ?? '') : '';
    const dateTo = controlled ? (dateToProp ?? '') : '';
    const setDateFrom = onDateFromChange;
    const setDateTo = onDateToChange;

    const setPage = controlled ? onPageChange! : setLocalPage;

    const [renameOpen, setRenameOpen] = useState(false);
    const [renameTarget, setRenameTarget] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [renameInput, setRenameInput] = useState('');

    const handleEdit = useCallback(
        (sermonId: string) => {
            navigate('/upload-sermon', {
                state: { resumeSermonId: sermonId },
            });
        },
        [navigate],
    );

    const invalidateMinisterLists = useCallback(async () => {
        if (ministerId) {
            await queryClient.invalidateQueries({
                queryKey: sermonQueryKeys.ministerListRoot(ministerId),
            });
        }
        await queryClient.invalidateQueries({
            queryKey: sermonQueryKeys.all,
        });
    }, [ministerId, queryClient]);

    const openRename = useCallback(
        (sermonId: string) => {
            const row = sermons.find((s) => s.id === sermonId);
            setRenameTarget({ id: sermonId, name: row?.name ?? '' });
            setRenameInput(row?.name ?? '');
            setRenameOpen(true);
        },
        [sermons],
    );

    const submitRename = useCallback(async () => {
        if (!renameTarget) return;
        const title = renameInput.trim();
        if (!title) {
            toast.error('Title is required.');
            return;
        }
        try {
            const res = await updateSermonMutation.mutateAsync({
                id: renameTarget.id,
                payload: { title },
            });
            if (res.error) {
                if (!isApiHttp2xxErrorEnvelope(res)) {
                    toast.error(res.message || 'Could not rename sermon.');
                }
                return;
            }
            toast.success('Sermon renamed.');
            setRenameOpen(false);
            setRenameTarget(null);
            await invalidateMinisterLists();
        } catch (e: unknown) {
            toast.error(
                e && typeof e === 'object' && 'message' in e
                    ? String((e as { message: unknown }).message)
                    : 'Could not rename sermon.',
            );
        }
    }, [
        renameTarget,
        renameInput,
        invalidateMinisterLists,
        updateSermonMutation,
    ]);

    const handleRename = useCallback(
        (sermonId: string) => {
            openRename(sermonId);
        },
        [openRename],
    );

    const handleDuplicate = useCallback(() => {
        toast.message('Duplicate sermon is not available yet.');
    }, []);

    const handleMove = useCallback(() => {
        toast.message('Move to series is not available yet.');
    }, []);

    const handleShare = useCallback((sermonId: string) => {
        const url = `${window.location.origin}/sermon/${sermonId}`;
        void navigator.clipboard.writeText(url).then(
            () => {
                toast.success('Link copied to clipboard.');
            },
            () => {
                toast.error('Could not copy link.');
            },
        );
    }, []);

    const handleDownload = useCallback(async (sermonId: string) => {
        try {
            const body = await fetchSermonDetail(sermonId);
            const d = (
                body as { data?: Record<string, unknown> } | undefined
            )?.data;
            const url =
                d && typeof d.sermonUrl === 'string' ? d.sermonUrl : null;
            if (!url) {
                toast.error('No audio file is available for this sermon yet.');
                return;
            }
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
            toast.error('Could not load sermon details.');
        }
    }, []);

    const handleAnalytics = useCallback(() => {
        toast.message('Analytics for this sermon is not available yet.');
    }, []);

    const handleMoveToTrash = useCallback(
        async (sermonId: string) => {
            if (!window.confirm('Move this sermon to trash?')) {
                return;
            }
            try {
                const res = await moveSermonToBinMutation.mutateAsync({
                    id: sermonId,
                });
                if (res.error) {
                    if (!isApiHttp2xxErrorEnvelope(res)) {
                        toast.error(res.message || 'Could not move sermon.');
                    }
                    return;
                }
                toast.success('Sermon moved to trash.');
                await invalidateMinisterLists();
            } catch (e: unknown) {
                toast.error(
                    e && typeof e === 'object' && 'message' in e
                        ? String((e as { message: unknown }).message)
                        : 'Could not move sermon to trash.',
                );
            }
        },
        [invalidateMinisterLists, moveSermonToBinMutation],
    );

    const uncontrolledFiltered = useMemo(() => {
        if (controlled) return sermons;
        const f = clientFilterSermons(
            sermons,
            debouncedLocalSearch,
            localStatus,
        );
        return clientSortSermons(f, localSort);
    }, [controlled, sermons, debouncedLocalSearch, localStatus, localSort]);

    const totalForPagination = controlled
        ? totalCountProp!
        : uncontrolledFiltered.length;

    useEffect(() => {
        if (controlled) return;
        setLocalPage(1);
    }, [
        controlled,
        debouncedLocalSearch,
        localStatus,
        localSort,
        activeTab,
        viewMode,
    ]);

    useEffect(() => {
        if (controlled) return;
        const tp = Math.max(1, Math.ceil(totalForPagination / pageSize));
        setLocalPage((p) => Math.min(Math.max(1, p), tp));
    }, [controlled, totalForPagination, pageSize]);

    const pageSlice = useMemo(() => {
        if (controlled) {
            return sermons;
        }
        const start = (localPage - 1) * pageSize;
        return uncontrolledFiltered.slice(start, start + pageSize);
    }, [controlled, sermons, uncontrolledFiltered, localPage, pageSize]);

    const getFilteredSermons = (): Sermon[] => {
        if (activeTab === 'Playlists' || activeTab === 'Series') {
            return [];
        }
        return pageSlice;
    };

    const filteredSermons = getFilteredSermons();
    const hasFilteredSermons = filteredSermons.length > 0;

    const displayPage = controlled ? page : localPage;

    const handleDateCreatedHeaderClick = useCallback(() => {
        if (sort === '-createdAt') {
            setSort('createdAt');
        } else {
            setSort('-createdAt');
        }
    }, [sort, setSort]);

    const allOnPageSelected =
        pageSlice.length > 0 &&
        pageSlice.every((s) => selectedSermons.has(s.id));

    const handleSelectAll = () => {
        const ids = pageSlice.map((s) => s.id);
        const next = new Set(selectedSermons);
        const allOn = ids.every((id) => next.has(id));
        if (allOn) {
            ids.forEach((id) => next.delete(id));
        } else {
            ids.forEach((id) => next.add(id));
        }
        setSelectedSermons(next);
    };

    const handleSermonSelect = (sermonId: string) => {
        const next = new Set(selectedSermons);
        if (next.has(sermonId)) {
            next.delete(sermonId);
        } else {
            next.add(sermonId);
        }
        setSelectedSermons(next);
    };

    const sortLabel =
        SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

    const filterSummaryParts: string[] = [];
    if (status !== 'all') {
        filterSummaryParts.push(status === 'draft' ? 'Draft' : 'Published');
    }
    if (dateFrom) filterSummaryParts.push(`From ${dateFrom}`);
    if (dateTo) filterSummaryParts.push(`To ${dateTo}`);
    const filterSummary =
        filterSummaryParts.length > 0
            ? filterSummaryParts.join(' · ')
            : 'Filters';

    return (
        <div
            className={cn(
                MY_SERMONS_PAGE.pageBg,
                'flex min-h-0 flex-1 flex-col',
            )}
        >
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rename sermon</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        placeholder="Title"
                        aria-label="New sermon title"
                    />
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRenameOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void submitRename()}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <UploadEntryStepModal
                open={entryModalOpen}
                onOpenChange={setEntryModalOpen}
                isLoading={uploadState.isLoading}
                onFileSelected={(file) => {
                    applySelectedAudioToUpload(dispatch, file);
                    setEntryModalOpen(false);
                    navigate('/upload-sermon');
                }}
            />
            <div className={MY_SERMONS_PAGE.mainColumn}>
                <div className={MY_SERMONS_PAGE.chromeStack}>
                    <header className={MY_SERMONS_PAGE.headerRow}>
                        <div className={MY_SERMONS_PAGE.titleCluster}>
                            <span className={MY_SERMONS_PAGE.titleIconWrap}>
                                <SermonTitleMicGlyph />
                            </span>
                            <h1 className={MY_SERMONS_PAGE.title}>
                                My Sermons
                            </h1>
                            {isFetching ? (
                                <span className="sr-only">Updating list</span>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            className={MY_SERMONS_PAGE.createCta}
                            onClick={() => setEntryModalOpen(true)}
                        >
                            <Plus
                                className="h-5 w-5 shrink-0 "
                                strokeWidth={2}
                                aria-hidden
                            />
                            Create sermon
                        </button>
                    </header>

                    <nav
                        className={MY_SERMONS_PAGE.tabStrip}
                        aria-label="Sermon categories"
                    >
                        {MAIN_TABS.map((tab) => {
                            const active = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        MY_SERMONS_PAGE.tabBtn,
                                        active
                                            ? MY_SERMONS_PAGE.tabBtnActive
                                            : MY_SERMONS_PAGE.tabBtnInactive,
                                    )}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </nav>

                    <div className={MY_SERMONS_PAGE.toolbarRow}>
                        <div className={MY_SERMONS_PAGE.toolbarLeft}>
                            <div className={MY_SERMONS_PAGE.searchWrap}>
                                <Search
                                    className={MY_SERMONS_PAGE.searchIcon}
                                    strokeWidth={2}
                                    aria-hidden
                                />
                                <input
                                    type="search"
                                    placeholder="Search sermons"
                                    className={MY_SERMONS_PAGE.searchInput}
                                    aria-label="Search sermons"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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
                                        Status
                                    </DropdownMenuLabel>
                                    <DropdownMenuRadioGroup
                                        value={status}
                                        onValueChange={(v) =>
                                            setStatus(
                                                v as MinisterSermonListParams['status'],
                                            )
                                        }
                                    >
                                        <DropdownMenuRadioItem value="all">
                                            All
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="draft">
                                            Draft
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="published">
                                            Published
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                    {controlled && setDateFrom && setDateTo ? (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>
                                                Date created
                                            </DropdownMenuLabel>
                                            <div className="flex flex-col gap-2 px-2 py-1.5">
                                                <label className="text-xs text-muted-foreground">
                                                    From
                                                    <Input
                                                        type="date"
                                                        className="mt-1 h-8"
                                                        value={dateFrom}
                                                        onChange={(e) =>
                                                            setDateFrom(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </label>
                                                <label className="text-xs text-muted-foreground">
                                                    To
                                                    <Input
                                                        type="date"
                                                        className="mt-1 h-8"
                                                        value={dateTo}
                                                        onChange={(e) =>
                                                            setDateTo(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </label>
                                            </div>
                                        </>
                                    ) : null}
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                                            SORT_OPTIONS.some(
                                                (o) => o.value === sort,
                                            )
                                                ? sort
                                                : '-updatedAt'
                                        }
                                        onValueChange={(v) => setSort(v)}
                                    >
                                        {SORT_OPTIONS.map((opt) => (
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
                    {hasFilteredSermons ? (
                        <div className={MY_SERMONS_PAGE.contentWithFooter}>
                            <div className={MY_SERMONS_PAGE.contentScroll}>
                                {viewMode === 'grid' ? (
                                    <SermonsGridView
                                        sermons={filteredSermons}
                                        onEdit={handleEdit}
                                        onRename={handleRename}
                                        onDuplicate={handleDuplicate}
                                        onMove={handleMove}
                                        onShare={handleShare}
                                        onDownload={handleDownload}
                                        onAnalytics={handleAnalytics}
                                        onMoveToTrash={handleMoveToTrash}
                                    />
                                ) : (
                                    <SermonsListView
                                        sermons={filteredSermons}
                                        selectedSermons={selectedSermons}
                                        selectAll={allOnPageSelected}
                                        onSelectAll={handleSelectAll}
                                        onSermonSelect={handleSermonSelect}
                                        onEdit={handleEdit}
                                        onRename={handleRename}
                                        onDuplicate={handleDuplicate}
                                        onMove={handleMove}
                                        onShare={handleShare}
                                        onDownload={handleDownload}
                                        onAnalytics={handleAnalytics}
                                        onMoveToTrash={handleMoveToTrash}
                                        sortKey={sort}
                                        onDateCreatedSortClick={
                                            handleDateCreatedHeaderClick
                                        }
                                    />
                                )}
                            </div>
                            <MySermonsPagination
                                page={displayPage}
                                pageSize={pageSize}
                                total={totalForPagination}
                                onPageChange={setPage}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="text-center">
                                <h3 className="mb-2 font-matter-medium text-lg text-[#eaeaea]">
                                    Nothing here
                                </h3>
                                <p className="font-matter text-sm leading-5 text-[#9d9d9d] ">
                                    {activeTab === 'Playlists'
                                        ? 'Playlists are not available yet.'
                                        : activeTab === 'Series'
                                          ? 'Series are not available yet.'
                                          : 'No audio sermons match your filters. Try adjusting search or filters.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SermonsTable;
