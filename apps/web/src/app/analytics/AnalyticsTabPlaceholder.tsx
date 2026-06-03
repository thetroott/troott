import { analyticsPanelClass } from '@/components/shared/analytics/analytics-ui';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import { cn } from '@/lib/utils';

interface AnalyticsTabPlaceholderProps {
    message: string;
}

export default function AnalyticsTabPlaceholder({
    message,
}: AnalyticsTabPlaceholderProps) {
    return (
        <div className={cn(analyticsPanelClass, 'overflow-hidden')}>
            <StudioEmptyState
                placement="panelTall"
                description={message}
                className="min-h-[320px]"
            />
        </div>
    );
}
