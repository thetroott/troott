import { cn } from '@/lib/utils';

interface AnalyticsDeltaBadgeProps {
    deltaPercent: number;
    className?: string;
}

export default function AnalyticsDeltaBadge({
    deltaPercent,
    className,
}: AnalyticsDeltaBadgeProps) {
    const isUp = deltaPercent > 0;
    const isDown = deltaPercent < 0;
    const label = `${Math.abs(deltaPercent)}%`;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 rounded-xl px-2 py-0.5 text-xs font-medium',
                isUp && 'bg-emerald-900/60 text-emerald-100',
                isDown && 'bg-[#8f3628] text-[#fddcd8]',
                !isUp && !isDown && 'bg-[#8f3628] text-[#fddcd8]',
                className,
            )}
        >
            {isUp ? '▲' : '▼'} {label}
        </span>
    );
}
