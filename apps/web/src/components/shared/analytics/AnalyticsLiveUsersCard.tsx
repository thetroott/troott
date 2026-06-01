import { MoreHorizontal } from 'lucide-react';
import { analyticsPanelClass } from '@/components/shared/analytics/analytics-ui';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDurationSeconds } from '@/hooks/app/analytics-overview.util';
import type { AnalyticsOverviewResponse } from '@/types/analytics';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AnalyticsLiveUsersCardProps {
    data?: AnalyticsOverviewResponse;
    isLoading?: boolean;
    onRefresh?: () => void;
}

function LiveGauge({ value, max = 100 }: { value: number; max?: number }) {
    const clamped = Math.min(Math.max(value, 0), max);
    const angle = -90 + (clamped / max) * 180;
    const r = 90;
    const cx = 140;
    const cy = 120;

    return (
        <svg viewBox="0 0 280 140" className="mx-auto h-40 w-full max-w-[280px]">
            <path
                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none"
                stroke="#545454"
                strokeWidth={12}
                strokeLinecap="round"
            />
            <path
                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={`${(clamped / max) * 283} 283`}
            />
            <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
            <g transform={`rotate(${angle} ${cx} ${cy})`}>
                <rect
                    x={cx - 4}
                    y={cy - 100}
                    width={8}
                    height={100}
                    rx={4}
                    fill="#bdbdbd"
                />
                <circle cx={cx} cy={cy} r={10} fill="#bdbdbd" />
            </g>
            <text x={20} y={130} className="fill-[#eaeaea] text-sm">
                0
            </text>
            <text x={250} y={130} className="fill-[#eaeaea] text-sm">
                {max}
            </text>
        </svg>
    );
}

export default function AnalyticsLiveUsersCard({
    data,
    isLoading = false,
    onRefresh,
}: AnalyticsLiveUsersCardProps) {
    if (isLoading || !data) {
        return (
            <div className={cn(analyticsPanelClass, 'p-4')}>
                <Skeleton className="mb-4 h-12 w-full" />
                <Skeleton className="mx-auto mb-4 h-40 w-full max-w-[280px]" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }

    const { live } = data;

    return (
        <div className={cn(analyticsPanelClass, 'flex flex-col p-4')}>
            <div className="mb-2 flex items-start justify-between border-b border-[#545454]/50 pb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span
                            className="size-2 rounded-full bg-[#2383e0]"
                            aria-hidden
                        />
                        <h2 className="text-base font-medium text-[#eaeaea]">
                            Current Live Users
                        </h2>
                    </div>
                    <p className="mt-1 text-sm text-[#9d9d9d]">Realtime</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-[#bdbdbd]"
                            aria-label="Live users actions"
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onRefresh?.()}>
                            Refresh
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            disabled
                            onSelect={() =>
                                toast.message('About live metrics is not available yet.')
                            }
                        >
                            About live metrics
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <LiveGauge value={live.currentUsers} />
            <div className="mt-auto grid grid-cols-2 gap-4 border-t border-[#545454]/50 pt-4">
                <div>
                    <div className="mb-2 h-0.5 w-full bg-[#545454]" />
                    <p className="text-sm text-[#eaeaea]">New Followers</p>
                    <p className="text-base font-medium text-[#eaeaea]">
                        {live.newFollowers}
                    </p>
                </div>
                <div>
                    <div className="mb-2 h-0.5 w-full bg-[#545454]" />
                    <p className="text-sm text-[#eaeaea]">Avg. play duration</p>
                    <p className="text-base font-medium text-[#eaeaea]">
                        {formatDurationSeconds(live.avgPlayDurationSeconds)}
                    </p>
                </div>
            </div>
        </div>
    );
}
