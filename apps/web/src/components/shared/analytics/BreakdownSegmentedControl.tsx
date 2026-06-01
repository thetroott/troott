import type { BreakdownDimension } from '@/types/analytics';
import { cn } from '@/lib/utils';

const SEGMENTS: { id: BreakdownDimension; label: string }[] = [
    { id: 'sermon', label: 'top sermon' },
    { id: 'region', label: 'top region' },
    { id: 'source', label: 'top source' },
];

interface BreakdownSegmentedControlProps {
    value: BreakdownDimension;
    onValueChange: (value: BreakdownDimension) => void;
}

export default function BreakdownSegmentedControl({
    value,
    onValueChange,
}: BreakdownSegmentedControlProps) {
    return (
        <div
            className="inline-flex overflow-hidden rounded-lg border border-[#545454]/50 bg-[#333234]"
            role="group"
            aria-label="Breakdown dimension"
        >
            {SEGMENTS.map((segment, index) => (
                <button
                    key={segment.id}
                    type="button"
                    onClick={() => onValueChange(segment.id)}
                    className={cn(
                        'px-3 py-1.5 text-sm transition-colors',
                        index > 0 && 'border-l border-[#545454]/50',
                        value === segment.id
                            ? 'bg-[#545454]/30 text-[#eaeaea]'
                            : 'text-[#bdbdbd] hover:text-[#eaeaea]',
                    )}
                >
                    {segment.label}
                </button>
            ))}
        </div>
    );
}

export { SEGMENTS as BREAKDOWN_SEGMENTS };
