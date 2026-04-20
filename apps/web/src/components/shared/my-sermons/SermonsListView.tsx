import { ArrowDown } from 'lucide-react';
import type { Sermon } from '@/_data/dummySermons';
import SermonContextMenu from './SermonContextMenu';
import { cn } from '@/lib/utils';
import {
    MY_SERMONS_LIST,
    SermonListAudioGlyph,
    SermonTableStatusPill,
} from '@/components/shared/my-sermons/my-sermons-ui';

interface SermonsListViewProps {
    sermons: Sermon[];
    selectedSermons: Set<string>;
    selectAll: boolean;
    onSelectAll: () => void;
    onSermonSelect: (sermonId: string) => void;
    onEdit: (sermonId: string) => void;
    onRename: (sermonId: string) => void;
    onDuplicate: (sermonId: string) => void;
    onMove: (sermonId: string) => void;
    onShare: (sermonId: string) => void;
    onDownload: (sermonId: string) => void;
    onAnalytics: (sermonId: string) => void;
    onMoveToTrash: (sermonId: string) => void;
}

const SermonsListView = ({
    sermons,
    selectedSermons,
    selectAll,
    onSelectAll,
    onSermonSelect,
    onEdit,
    onRename,
    onDuplicate,
    onMove,
    onShare,
    onDownload,
    onAnalytics,
    onMoveToTrash,
}: SermonsListViewProps) => {
    return (
        <div className={MY_SERMONS_LIST.scrollWrap}>
            <table className={MY_SERMONS_LIST.table}>
                <colgroup>
                    <col style={{ width: 46 }} />
                    <col style={{ width: 400 }} />
                    <col style={{ width: 135 }} />
                    <col style={{ width: 135 }} />
                    <col style={{ width: 135 }} />
                    <col style={{ width: 135 }} />
                    <col style={{ width: 135 }} />
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
                                    aria-label="Select all sermons"
                                />
                            </div>
                        </th>
                        <th scope="col" className={MY_SERMONS_LIST.thCell}>
                            Sermon
                        </th>
                        <th scope="col" className={MY_SERMONS_LIST.thCell}>
                            <span className={MY_SERMONS_LIST.thSortableInner}>
                                Date Created
                                <span
                                    className={MY_SERMONS_LIST.thSortBadge}
                                    aria-hidden
                                >
                                    <ArrowDown
                                        className="h-2.5 w-2.5 shrink-0"
                                        strokeWidth={2.5}
                                    />
                                </span>
                            </span>
                        </th>
                        <th scope="col" className={MY_SERMONS_LIST.thCell}>
                            Status
                        </th>
                        <th
                            scope="col"
                            className={cn(MY_SERMONS_LIST.thCell, 'text-right')}
                        >
                            Plays
                        </th>
                        <th
                            scope="col"
                            className={cn(MY_SERMONS_LIST.thCell, 'text-right')}
                        >
                            Comments
                        </th>
                        <th scope="col" className={MY_SERMONS_LIST.thCell}>
                            Likes
                        </th>
                        <th
                            scope="col"
                            className={cn(MY_SERMONS_LIST.thCell, 'w-[46px] max-w-[46px] px-0')}
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
                                        onChange={() =>
                                            onSermonSelect(sermon.id)
                                        }
                                        className={MY_SERMONS_LIST.checkbox}
                                        aria-label={`Select ${sermon.name}`}
                                    />
                                </div>
                            </td>
                            <td className={MY_SERMONS_LIST.tdCell}>
                                <div className="flex min-w-0 items-center gap-3">
                                    <SermonListAudioGlyph />
                                    <div className="min-w-0 flex-1">
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
                                <SermonTableStatusPill
                                    status={sermon.publicationStatus}
                                />
                            </td>
                            <td
                                className={cn(
                                    MY_SERMONS_LIST.tdCell,
                                    'text-right',
                                )}
                            >
                                <span className={MY_SERMONS_LIST.stat}>
                                    {sermon.plays}
                                </span>
                            </td>
                            <td
                                className={cn(
                                    MY_SERMONS_LIST.tdCell,
                                    'text-right',
                                )}
                            >
                                <span className={MY_SERMONS_LIST.stat}>
                                    {sermon.comments}
                                </span>
                            </td>
                            <td className={MY_SERMONS_LIST.tdCell}>
                                <span className={MY_SERMONS_LIST.likesCell}>
                                    {sermon.likes} Likes
                                </span>
                            </td>
                            <td
                                className={cn(
                                    MY_SERMONS_LIST.tdCell,
                                    'w-[46px] max-w-[46px] px-0',
                                )}
                            >
                                <div className={MY_SERMONS_LIST.tdActionInner}>
                                <SermonContextMenu
                                    sermonId={sermon.id}
                                    menuIcon="vertical"
                                    onEdit={onEdit}
                                        onRename={onRename}
                                        onDuplicate={onDuplicate}
                                        onMove={onMove}
                                        onShare={onShare}
                                        onDownload={onDownload}
                                        onAnalytics={onAnalytics}
                                        onMoveToTrash={onMoveToTrash}
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

export default SermonsListView;
