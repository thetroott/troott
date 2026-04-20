import type { Sermon } from '@/_data/dummySermons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useUpload } from '@/context/upload/upload.context';
import UploadEntryStepModal from '@/components/shared/upload/UploadEntryStepModal';
import { applySelectedAudioToUpload } from '@/utils/upload-audio-selection.util';
import {
    ArrowDown,
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

export type { Sermon };

interface SermonsTableProps {
    sermons: Sermon[];
}

type MainTab = 'Audio' | 'Playlists';

const MAIN_TABS: MainTab[] = ['Audio', 'Playlists'];

/** Matches Figma table footer (`1-16 of 100`). */
const PAGE_SIZE = 16;

const SermonsTable = ({ sermons }: SermonsTableProps) => {
    const navigate = useNavigate();
    const { dispatch, state: uploadState } = useUpload();
    const [entryModalOpen, setEntryModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<MainTab>('Audio');
    const [selectedSermons, setSelectedSermons] = useState<Set<string>>(
        new Set(),
    );
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [page, setPage] = useState(1);

    const handleEdit = (sermonId: string) => {
        console.log('Edit sermon:', sermonId);
    };

    const handleRename = (sermonId: string) => {
        console.log('Rename sermon:', sermonId);
    };

    const handleDuplicate = (sermonId: string) => {
        console.log('Duplicate sermon:', sermonId);
    };

    const handleMove = (sermonId: string) => {
        console.log('Move sermon:', sermonId);
    };

    const handleShare = (sermonId: string) => {
        console.log('Share sermon:', sermonId);
    };

    const handleDownload = (sermonId: string) => {
        console.log('Download sermon:', sermonId);
    };

    const handleAnalytics = (sermonId: string) => {
        console.log('View analytics for sermon:', sermonId);
    };

    const handleMoveToTrash = (sermonId: string) => {
        console.log('Move to trash:', sermonId);
    };

    const getFilteredSermons = (): Sermon[] => {
        if (activeTab === 'Playlists') {
            return [];
        }
        return sermons;
    };

    const filteredSermons = getFilteredSermons();
    const hasFilteredSermons = filteredSermons.length > 0;

    const totalPages = Math.max(
        1,
        Math.ceil(filteredSermons.length / PAGE_SIZE),
    );

    useEffect(() => {
        setPage(1);
    }, [filteredSermons.length, activeTab, viewMode]);

    useEffect(() => {
        setPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const pageSlice = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredSermons.slice(start, start + PAGE_SIZE);
    }, [filteredSermons, page]);

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

    return (
        <div className={cn(MY_SERMONS_PAGE.pageBg, 'flex min-h-0 flex-1 flex-col')}>
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
                            <h1 className={MY_SERMONS_PAGE.title}>My Sermons</h1>
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
                                />
                            </div>
                            <button
                                type="button"
                                className={MY_SERMONS_PAGE.pillBtn}
                            >
                                <Filter
                                    className={MY_SERMONS_PAGE.pillBtnIcon}
                                    aria-hidden
                                />
                                <span>Filters</span>
                                <ArrowDown
                                    className={MY_SERMONS_PAGE.pillBtnIcon}
                                    aria-hidden
                                />
                            </button>
                        </div>
                        <div className={MY_SERMONS_PAGE.toolbarRight}>
                            <button
                                type="button"
                                className={MY_SERMONS_PAGE.pillBtn}
                            >
                                <ArrowDownUp
                                    className={MY_SERMONS_PAGE.pillBtnIcon}
                                    aria-hidden
                                />
                                <span>Sort</span>
                                <ArrowDown
                                    className={MY_SERMONS_PAGE.pillBtnIcon}
                                    aria-hidden
                                />
                            </button>
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
                                    <List
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                    />
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
                                        sermons={pageSlice}
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
                                        sermons={pageSlice}
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
                                    />
                                )}
                            </div>
                            <MySermonsPagination
                                page={page}
                                pageSize={PAGE_SIZE}
                                total={filteredSermons.length}
                                onPageChange={setPage}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="text-center">
                                <h3 className="mb-2 font-matter-medium text-lg text-[#eaeaea]">
                                    Nothing here
                                </h3>
                                <p className="font-matter text-sm leading-5 text-[#9d9d9d]">
                                    {activeTab === 'Playlists'
                                        ? 'Playlists are not available yet.'
                                        : 'No audio sermons found. Try uploading from Create sermon.'}
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
