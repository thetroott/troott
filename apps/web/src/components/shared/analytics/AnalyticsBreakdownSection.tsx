import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Search } from 'lucide-react';
import AnalyticsBreakdownTable from '@/components/shared/analytics/AnalyticsBreakdownTable';
import BreakdownSegmentedControl from '@/components/shared/analytics/BreakdownSegmentedControl';
import { analyticsPanelClass } from '@/components/shared/analytics/analytics-ui';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticsBreakdown } from '@/hooks/app/useAnalyticsOverview';
import { emptyAnalyticsBreakdown } from '@/hooks/app/analytics-overview.util';
import type {
    AnalyticsBreakdownParams,
    AnalyticsBreakdownRow,
    BreakdownDimension,
} from '@/types/analytics';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { studioHomePath } from '@/routes/paths';

interface AnalyticsBreakdownSectionProps {
    studioCode: string;
    overviewParams: Omit<AnalyticsBreakdownParams, 'dimension' | 'q'>;
}

export default function AnalyticsBreakdownSection({
    studioCode,
    overviewParams,
}: AnalyticsBreakdownSectionProps) {
    const navigate = useNavigate();
    const [dimension, setDimension] = useState<BreakdownDimension>('sermon');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const t = window.setTimeout(
            () => setDebouncedSearch(searchInput.trim()),
            300,
        );
        return () => window.clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setSearchInput('');
        setDebouncedSearch('');
    }, [dimension, overviewParams.dateFrom, overviewParams.dateTo]);

    const breakdownParams: AnalyticsBreakdownParams = useMemo(
        () => ({
            ...overviewParams,
            dimension,
            q: debouncedSearch || undefined,
        }),
        [overviewParams, dimension, debouncedSearch],
    );

    const { data, isLoading, isError } = useAnalyticsBreakdown(
        studioCode,
        breakdownParams,
    );

    const rows = useMemo(() => {
        if (dimension !== 'sermon') {
            return [];
        }
        const source = data?.rows ?? emptyAnalyticsBreakdown().rows;
        const isEmpty =
            source.length === 1 && source[0]?.sermonTitle === 'No Data';
        if (isEmpty || !debouncedSearch) {
            return source;
        }
        const q = debouncedSearch.toLowerCase();
        return source.filter(
            (row) =>
                row.sermonTitle !== 'No Data' &&
                row.sermonTitle.toLowerCase().includes(q),
        );
    }, [data?.rows, debouncedSearch, dimension]);

    const showEmptyHelper =
        dimension === 'sermon' &&
        ((rows.length === 1 && rows[0]?.sermonTitle === 'No Data') ||
            rows.length === 0);

    const allSelected =
        rows.length > 0 &&
        rows.every(
            (r) => r.sermonTitle === 'No Data' || selectedIds.has(r.id),
        );

    const handleToggleAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
            return;
        }
        setSelectedIds(
            new Set(rows.filter((r) => r.sermonTitle !== 'No Data').map((r) => r.id)),
        );
    };

    const handleRowClick = (row: AnalyticsBreakdownRow) => {
        if (row.id === 'empty') {
            return;
        }
        navigate(`${studioHomePath(studioCode)}/sermons/${row.id}`);
    };

    if (isLoading) {
        return (
            <div className={cn(analyticsPanelClass, 'p-4')}>
                <Skeleton className="mb-4 h-8 w-full max-w-xl" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className={cn(analyticsPanelClass, 'p-6 text-sm text-[#bdbdbd]')}>
                Could not load breakdown data.
            </div>
        );
    }

    const displayRows =
        dimension !== 'sermon'
            ? emptyAnalyticsBreakdown().rows
            : rows.length > 0
              ? rows
              : emptyAnalyticsBreakdown().rows;

    return (
        <div className={cn(analyticsPanelClass, 'p-4')}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base font-medium text-[#eaeaea]">
                        Breakdown by
                    </h2>
                    <BreakdownSegmentedControl
                        value={dimension}
                        onValueChange={setDimension}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full min-w-[200px] sm:w-[200px]">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#bdbdbd]" />
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search analysis"
                            className="h-8 border-[#545454]/50 bg-transparent pl-9 text-[#bdbdbd] placeholder:text-[#bdbdbd]"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 text-[#bdbdbd]"
                                aria-label="Table actions"
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                disabled
                                onSelect={() =>
                                    toast.message('Export CSV is not available yet.')
                                }
                            >
                                Export CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled
                                onSelect={() =>
                                    toast.message(
                                        'Column visibility is not available yet.',
                                    )
                                }
                            >
                                Column visibility
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <AnalyticsBreakdownTable
                rows={displayRows}
                selectedIds={selectedIds}
                onToggleRow={(id) => {
                    setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) {
                            next.delete(id);
                        } else {
                            next.add(id);
                        }
                        return next;
                    });
                }}
                onToggleAll={handleToggleAll}
                allSelected={allSelected}
                onRowClick={dimension === 'sermon' ? handleRowClick : undefined}
                showEmptyHelper={showEmptyHelper}
            />
            {dimension !== 'sermon' ? (
                <p className="py-6 text-center text-xs text-[#bdbdbd]">
                    No data for this breakdown yet.
                </p>
            ) : null}
        </div>
    );
}
