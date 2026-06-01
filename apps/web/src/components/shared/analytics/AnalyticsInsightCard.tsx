import AnalyticsDeltaBadge from '@/components/shared/analytics/AnalyticsDeltaBadge';
import { cn } from '@/lib/utils';

interface AnalyticsInsightCardProps {
    label: string;
    value: string | number;
    deltaPercent?: number;
    compareLabel?: string;
    highlighted?: boolean;
}

export default function AnalyticsInsightCard({
    label,
    value,
    deltaPercent = 0,
    compareLabel,
    highlighted = false,
}: AnalyticsInsightCardProps) {
    return (
        <div
            className={cn(
                'flex min-h-[86px] flex-1 flex-col justify-between rounded-xl border border-[#545454]/50 p-4',
                highlighted ? 'bg-[#333234]' : 'bg-[#2b2a2c]',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-medium text-[#bdbdbd]">{label}</p>
                    <p className="mt-1 text-xl font-medium text-[#eaeaea]">
                        {value}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <AnalyticsDeltaBadge deltaPercent={deltaPercent} />
                    {compareLabel ? (
                        <span className="text-sm text-[#eaeaea]">
                            {compareLabel}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
