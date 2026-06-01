import type { AnalyticsPrimaryTab } from '@/types/analytics';
import { cn } from '@/lib/utils';

const TABS: { id: AnalyticsPrimaryTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sermon', label: 'Sermon' },
    { id: 'series', label: 'Series' },
];

interface AnalyticsPrimaryTabsProps {
    value: AnalyticsPrimaryTab;
    onValueChange: (tab: AnalyticsPrimaryTab) => void;
}

export default function AnalyticsPrimaryTabs({
    value,
    onValueChange,
}: AnalyticsPrimaryTabsProps) {
    return (
        <div className="border-b border-[#545454]">
            <div className="flex gap-4 px-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onValueChange(tab.id)}
                        className={cn(
                            'border-b-2 px-2 py-2.5 text-sm font-medium transition-colors',
                            value === tab.id
                                ? 'border-[#eaeaea] text-[#eaeaea]'
                                : 'border-transparent text-[#eaeaea] hover:text-white',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export { TABS as ANALYTICS_PRIMARY_TABS };
