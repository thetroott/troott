import { ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
    AnalyticsDateRangePreset,
    AnalyticsGranularity,
} from '@/types/analytics';
import {
    DATE_RANGE_LABELS,
    GRANULARITY_LABELS,
} from '@/hooks/app/analytics-overview.util';
import { toast } from 'sonner';

interface AnalyticsFilterBarProps {
    granularity: AnalyticsGranularity;
    dateRange: AnalyticsDateRangePreset;
    onGranularityChange: (value: AnalyticsGranularity) => void;
    onDateRangeChange: (value: AnalyticsDateRangePreset) => void;
}

export default function AnalyticsFilterBar({
    granularity,
    dateRange,
    onGranularityChange,
    onDateRangeChange,
}: AnalyticsFilterBarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-8 gap-2 border-[#545454]/50 bg-[#2b2a2c] text-[#bdbdbd]"
                    >
                        <Filter className="size-4" />
                        Add Filters
                        <ChevronDown className="size-4 opacity-70" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {['Sermon', 'Series', 'Region', 'Source'].map((item) => (
                        <DropdownMenuItem
                            key={item}
                            onSelect={() =>
                                toast.message('Filters are not available yet.')
                            }
                        >
                            {item}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-8 gap-2 border-[#545454]/50 text-[#bdbdbd]"
                        >
                            {GRANULARITY_LABELS[granularity]}
                            <ChevronDown className="size-4 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {(Object.keys(GRANULARITY_LABELS) as AnalyticsGranularity[]).map(
                            (key) => (
                                <DropdownMenuItem
                                    key={key}
                                    onSelect={() => onGranularityChange(key)}
                                >
                                    {GRANULARITY_LABELS[key]}
                                </DropdownMenuItem>
                            ),
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-8 gap-2 border-[#545454]/50 text-[#bdbdbd]"
                        >
                            {DATE_RANGE_LABELS[dateRange]}
                            <ChevronDown className="size-4 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {(Object.keys(DATE_RANGE_LABELS) as AnalyticsDateRangePreset[]).map(
                            (key) => (
                                <DropdownMenuItem
                                    key={key}
                                    onSelect={() => onDateRangeChange(key)}
                                >
                                    {DATE_RANGE_LABELS[key]}
                                </DropdownMenuItem>
                            ),
                        )}
                        <DropdownMenuItem disabled>Custom</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
