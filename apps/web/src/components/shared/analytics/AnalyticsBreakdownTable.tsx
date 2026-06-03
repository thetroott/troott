import type { AnalyticsBreakdownRow } from '@/types/analytics';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import { cn } from '@/lib/utils';

interface AnalyticsBreakdownTableProps {
    rows: AnalyticsBreakdownRow[];
    selectedIds: Set<string>;
    onToggleRow: (id: string) => void;
    onToggleAll: () => void;
    allSelected: boolean;
    onRowClick?: (row: AnalyticsBreakdownRow) => void;
    showEmptyHelper?: boolean;
}

function cell(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }
    return value;
}

export default function AnalyticsBreakdownTable({
    rows,
    selectedIds,
    onToggleRow,
    onToggleAll,
    allSelected,
    onRowClick,
    showEmptyHelper = false,
}: AnalyticsBreakdownTableProps) {
    const isEmptyPlaceholder =
        rows.length === 1 && rows[0]?.sermonTitle === 'No Data';

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-[#545454]/50">
                        <th className="w-12 px-2 py-3">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={onToggleAll}
                                className="size-[18px] rounded border-[#9d9d9d] bg-transparent accent-[#08ffdb]"
                                aria-label="Select all rows"
                            />
                        </th>
                        <th className="px-3 py-3 text-xs text-[#bdbdbd]">Sermon</th>
                        <th className="px-3 py-3 text-xs text-[#bdbdbd]">Plays</th>
                        <th className="px-3 py-3 text-xs text-[#bdbdbd]">
                            Impressions
                        </th>
                        <th className="px-3 py-3 text-xs text-[#bdbdbd]">
                            Unique Listeners
                        </th>
                        <th className="px-3 py-3 text-xs text-[#bdbdbd]">
                            Total Listening Time
                        </th>
                        <th className="px-3 py-3 text-xs text-[#bdbdbd]">
                            Avg. Listening Time
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            className={cn(
                                'border-b border-[#545454]/50',
                                !isEmptyPlaceholder &&
                                    onRowClick &&
                                    'cursor-pointer hover:bg-[#333234]/50',
                            )}
                            onClick={() => {
                                if (!isEmptyPlaceholder && onRowClick) {
                                    onRowClick(row);
                                }
                            }}
                        >
                            <td className="px-2 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(row.id)}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onToggleRow(row.id);
                                    }}
                                    className="size-[18px] rounded border-[#9d9d9d] bg-transparent accent-[#08ffdb]"
                                    aria-label={`Select ${row.sermonTitle}`}
                                />
                            </td>
                            <td className="px-3 py-3">
                                {isEmptyPlaceholder ? (
                                    <span className="font-medium text-[#eaeaea]">
                                        No Data
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        {row.thumbnailUrl ? (
                                            <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-[#333234]">
                                                <img
                                                    src={row.thumbnailUrl}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                                {row.durationLabel ? (
                                                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px] text-white">
                                                        {row.durationLabel}
                                                    </span>
                                                ) : null}
                                            </div>
                                        ) : null}
                                        <div>
                                            <p className="font-medium text-[#eaeaea]">
                                                {row.sermonTitle}
                                            </p>
                                            {row.sermonDate ? (
                                                <p className="text-xs text-[#bdbdbd]">
                                                    {row.sermonDate}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td className="px-3 py-3 text-[#eaeaea]">
                                {cell(row.plays)}
                            </td>
                            <td className="px-3 py-3 text-[#eaeaea]">
                                {cell(row.impressions)}
                            </td>
                            <td className="px-3 py-3 text-[#eaeaea]">
                                {cell(row.uniqueListeners)}
                            </td>
                            <td className="px-3 py-3 text-[#eaeaea]">
                                {cell(row.totalListeningTime)}
                            </td>
                            <td className="px-3 py-3 text-[#eaeaea]">
                                {cell(row.avgListeningTime)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showEmptyHelper ? (
                <StudioEmptyState
                    placement="panelCompact"
                    compactDescription
                    description="No data to show yet."
                />
            ) : null}
        </div>
    );
}
