import type { Sermon } from '@/_data/dummySermons';
import { ArrowDown, ArrowUp } from 'lucide-react';
import BinContextMenu from '@/components/shared/bin/BinContextMenu';
import { canStudioUserPermanentlyDeleteSermon } from '@/utils/sermon-studio-policy.util';
import { cn } from '@/lib/utils';
import {
    MY_SERMONS_LIST,
    SermonListAudioGlyph,
} from '@/components/shared/my-sermons/my-sermons-ui';

function BinStatusPill() {
    return (
        <span className="inline-flex items-center rounded-md bg-[#545454]/50 px-2 py-0.5 font-matter-medium text-[12px] leading-[18px] tracking-[0.24px] text-[#bdbdbd]">
            In bin
        </span>
    );
}

interface BinListViewProps {
    sermons: Sermon[];
    selectedSermons: Set<string>;
    selectAll: boolean;
    onSelectAll: () => void;
    onSermonSelect: (sermonId: string) => void;
    onGetInfo?: (sermonId: string) => void;
    onRestore: (sermonId: string) => void;
    onEmptyImmediately: (sermonId: string) => void;
    sortKey?: string;
    onDateCreatedSortClick?: () => void;
}

const BinListView = ({
    sermons,
    selectedSermons,
    selectAll,
    onSelectAll,
    onSermonSelect,
    onGetInfo,
    onRestore,
    onEmptyImmediately,
    sortKey = '-updatedAt',
    onDateCreatedSortClick,
}: BinListViewProps) => {
    const dateSortDesc =
        sortKey === '-createdAt' ||
        (sortKey?.includes('createdAt') && sortKey.startsWith('-'));

    return (
        <div className={MY_SERMONS_LIST.scrollWrap}>
            <table className={cn(MY_SERMONS_LIST.table, 'min-w-[800px]')}>
                <colgroup>
                    <col style={{ width: 46 }} />
                    <col />
                    <col style={{ width: 160 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 46 }} />
                </colgroup>
                <thead className={MY_SERMONS_LIST.thead}>
                    <tr className={MY_SERMONS_LIST.theadRow}>
                        <th
                            scope="col"
                            className={cn(
                                MY_SERMONS_LIST.thCell,
                                'w-[46px] max-w-[46px] px-0',
                            )}
                        >
                            <div className={MY_SERMONS_LIST.thCheckboxInner}>
                                <span className="sr-only">Select all</span>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={onSelectAll}
                                    className={MY_SERMONS_LIST.checkbox}
                                    aria-label="Select all sermons on page"
                                />
                            </div>
                        </th>
                        <th scope="col" className={MY_SERMONS_LIST.thCell}>
                            Sermon
                        </th>
                        <th scope="col" className={MY_SERMONS_LIST.thCell}>
                            {onDateCreatedSortClick ? (
                                <button
                                    type="button"
                                    className={cn(
                                        MY_SERMONS_LIST.thSortableInner,
                                        'cursor-pointer rounded-sm text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/40',
                                    )}
                                    onClick={onDateCreatedSortClick}
                                    aria-label={`Sort by date created, ${
                                        dateSortDesc
                                            ? 'newest first'
                                            : 'oldest first'
                                    }`}
                                >
                                    Date Created
                                    <span
                                        className={MY_SERMONS_LIST.thSortBadge}
                                        aria-hidden
                                    >
                                        {dateSortDesc ? (
                                            <ArrowDown
                                                className="h-2.5 w-2.5 shrink-0"
                                                strokeWidth={2.5}
                                            />
                                        ) : (
                                            <ArrowUp
                                                className="h-2.5 w-2.5 shrink-0"
                                                strokeWidth={2.5}
                                            />
                                        )}
                                    </span>
                                </button>
                            ) : (
                                'Date Created'
                            )}
                        </th>
                        <th scope="col" className={MY_SERMONS_LIST.thCell}>
                            Status
                        </th>
                        <th
                            scope="col"
                            className={cn(
                                MY_SERMONS_LIST.thCell,
                                'w-[46px] max-w-[46px] px-0',
                            )}
                        >
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sermons.map((sermon) => (
                        <tr key={sermon.id} className={MY_SERMONS_LIST.tbodyRow}>
                            <td
                                className={cn(
                                    MY_SERMONS_LIST.tdCell,
                                    'w-[46px] max-w-[46px] px-0',
                                )}
                            >
                                <div className={MY_SERMONS_LIST.tdCheckboxInner}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSermons.has(sermon.id)}
                                        onChange={() => onSermonSelect(sermon.id)}
                                        className={cn(
                                            MY_SERMONS_LIST.checkbox,
                                            'transition-colors group-hover/sermon-row:border-[#eaeaea]',
                                        )}
                                        aria-label={`Select ${sermon.name}`}
                                    />
                                </div>
                            </td>
                            <td className={MY_SERMONS_LIST.tdCell}>
                                <div className="flex min-w-0 items-center gap-3">
                                    <SermonListAudioGlyph size="sm" />
                                    <div className="flex min-h-[38px] min-w-0 flex-1 flex-col justify-center gap-0.5">
                                        <p
                                            className={cn(
                                                MY_SERMONS_LIST.title,
                                                'truncate',
                                            )}
                                        >
                                            {sermon.name}
                                        </p>
                                        <p className={MY_SERMONS_LIST.duration}>
                                            {sermon.duration}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className={MY_SERMONS_LIST.tdCell}>
                                <span className={MY_SERMONS_LIST.date}>
                                    {sermon.dateCreated}
                                </span>
                            </td>
                            <td className={MY_SERMONS_LIST.tdCell}>
                                <BinStatusPill />
                            </td>
                            <td
                                className={cn(
                                    MY_SERMONS_LIST.tdCell,
                                    'w-[46px] max-w-[46px] px-0',
                                )}
                            >
                                <div className={MY_SERMONS_LIST.tdActionInner}>
                                    <BinContextMenu
                                        sermonId={sermon.id}
                                        onGetInfo={onGetInfo}
                                        onRestore={onRestore}
                                        onEmptyImmediately={onEmptyImmediately}
                                        canPermanentlyDelete={canStudioUserPermanentlyDeleteSermon(
                                            sermon,
                                        )}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BinListView;
