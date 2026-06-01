import {
    ArrowDown,
    ArrowDownUp,
    Filter,
    LayoutGrid,
    List,
    Plus,
    Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    MY_SERMONS_PAGE,
    SermonTitleMicGlyph,
} from '@/components/shared/my-sermons/my-sermons-ui';
import SermonsListView from '@/components/shared/my-sermons/SermonsListView';
import MySermonsPagination from '@/components/shared/my-sermons/MySermonsPagination';

const noop = () => {};

/** Figma empty My Sermons list — table chrome [`10154:35090`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35090). */
export function MySermonsEmptyTableSection() {
    return (
        <div className={MY_SERMONS_PAGE.contentWithFooter}>
            <div className={MY_SERMONS_PAGE.contentScroll}>
                <SermonsListView
                    sermons={[]}
                    selectedSermons={new Set()}
                    selectAll={false}
                    onSelectAll={noop}
                    onSermonSelect={noop}
                    onEdit={noop}
                    onRename={noop}
                    onDuplicate={noop}
                    onMove={noop}
                    onShare={noop}
                    onDownload={noop}
                    onAnalytics={noop}
                    onMoveToTrash={noop}
                    sortKey="-createdAt"
                />
            </div>
            <MySermonsPagination
                page={1}
                pageSize={16}
                total={0}
                onPageChange={noop}
            />
        </div>
    );
}

interface MySermonsEmptyShellProps {
    className?: string;
    /** Decorative backdrop (no interaction) — e.g. behind upload modal. */
    decorative?: boolean;
    onCreateSermon?: () => void;
}

/**
 * Full My Sermons page shell with empty list table — used as upload modal backdrop
 * and first-time empty library (Figma `10154:35090`).
 */
export function MySermonsEmptyShell({
    className,
    decorative = false,
    onCreateSermon,
}: MySermonsEmptyShellProps) {
    return (
        <div
            className={cn(
                MY_SERMONS_PAGE.pageBg,
                'flex min-h-0 flex-1 flex-col',
                decorative && 'pointer-events-none select-none',
                className,
            )}
            aria-hidden={decorative ? true : undefined}
        >
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
                            onClick={onCreateSermon}
                            disabled={decorative}
                            tabIndex={decorative ? -1 : undefined}
                        >
                            <Plus
                                className="h-5 w-5 shrink-0"
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
                        {(['Sermon', 'Series', 'Playlists'] as const).map(
                            (tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === 'Sermon'}
                                    disabled={decorative}
                                    tabIndex={decorative ? -1 : undefined}
                                    className={cn(
                                        MY_SERMONS_PAGE.tabBtn,
                                        tab === 'Sermon'
                                            ? MY_SERMONS_PAGE.tabBtnActive
                                            : MY_SERMONS_PAGE.tabBtnInactive,
                                    )}
                                >
                                    {tab}
                                </button>
                            ),
                        )}
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
                                    disabled={decorative}
                                    tabIndex={decorative ? -1 : undefined}
                                    readOnly={decorative}
                                />
                            </div>
                            <button
                                type="button"
                                className={MY_SERMONS_PAGE.pillBtn}
                                disabled={decorative}
                                tabIndex={decorative ? -1 : undefined}
                            >
                                <Filter
                                    className={MY_SERMONS_PAGE.pillBtnIcon}
                                    aria-hidden
                                />
                                Filters
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
                                disabled={decorative}
                                tabIndex={decorative ? -1 : undefined}
                            >
                                <ArrowDownUp
                                    className={MY_SERMONS_PAGE.pillBtnIcon}
                                    aria-hidden
                                />
                                Recently updated
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
                                    aria-pressed={false}
                                    disabled={decorative}
                                    tabIndex={decorative ? -1 : undefined}
                                    className={cn(
                                        MY_SERMONS_PAGE.viewToggleBtn,
                                        MY_SERMONS_PAGE.viewToggleBtnIdle,
                                    )}
                                >
                                    <LayoutGrid
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                    />
                                </button>
                                <button
                                    type="button"
                                    aria-pressed
                                    disabled={decorative}
                                    tabIndex={decorative ? -1 : undefined}
                                    className={cn(
                                        MY_SERMONS_PAGE.viewToggleBtn,
                                        MY_SERMONS_PAGE.viewToggleBtnActive,
                                    )}
                                >
                                    <List className="h-4 w-4" strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={MY_SERMONS_PAGE.contentStack}>
                    <MySermonsEmptyTableSection />
                </div>
            </div>
        </div>
    );
}

export default MySermonsEmptyShell;
