import { Link } from 'react-router-dom';
import { analyticsPanelClass } from '@/components/shared/analytics/analytics-ui';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AnalyticsSermonEmptyProps = {
    sermonsListPath: string;
};

export default function AnalyticsSermonEmpty({
    sermonsListPath,
}: AnalyticsSermonEmptyProps) {
    return (
        <div className={cn(analyticsPanelClass, 'overflow-hidden')}>
            <StudioEmptyState
                placement="panelTall"
                wideDescription
                description="Select a sermon from My Sermons or the overview breakdown table to view its analytics."
            >
                <Button
                    type="button"
                    className="bg-[#08ffdb] text-[#1f2020] hover:bg-[#08ffdb]/90"
                    asChild
                >
                    <Link to={sermonsListPath}>Go to My Sermons</Link>
                </Button>
            </StudioEmptyState>
        </div>
    );
}
