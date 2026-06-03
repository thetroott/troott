import { Link } from 'react-router-dom';
import { ArrowLeft, SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    SermonListAudioGlyph,
    SermonTableStatusPill,
} from '@/components/shared/my-sermons/my-sermons-ui';
import { analyticsPanelClass } from '@/components/shared/analytics/analytics-ui';
import type { SermonAnalyticsHeaderModel } from '@/utils/sermon-analytics.util';
import { cn } from '@/lib/utils';

type SermonAnalyticsHeaderProps = {
    header: SermonAnalyticsHeaderModel;
    backTo: string;
    backLabel: string;
    editPath: string;
};

export default function SermonAnalyticsHeader({
    header,
    backTo,
    backLabel,
    editPath,
}: SermonAnalyticsHeaderProps) {
    return (
        <div className={cn(analyticsPanelClass, 'p-4 sm:p-5')}>
            <Link
                to={backTo}
                className="mb-4 inline-flex items-center gap-2 font-matter text-sm text-[#bdbdbd] transition-colors hover:text-[#eaeaea]"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {backLabel}
            </Link>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[#545454]/50 bg-[#242325] sm:h-[72px] sm:w-[72px]">
                        {header.thumbnailUrl ? (
                            <img
                                src={header.thumbnailUrl}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <SermonListAudioGlyph size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="line-clamp-2 font-matter-medium text-lg leading-6 text-[#eaeaea]">
                            {header.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <SermonTableStatusPill status={header.status} />
                            <span className="font-matter text-sm text-[#9d9d9d]">
                                {header.durationLabel}
                            </span>
                            <span className="font-matter text-sm text-[#9d9d9d]">
                                {header.dateLabel}
                            </span>
                        </div>
                        {header.processingLabel ? (
                            <p className="mt-2 font-matter text-sm text-[#bdbdbd]">
                                {header.processingLabel}
                            </p>
                        ) : null}
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 border-[#707070] text-[#eaeaea] hover:bg-white/5"
                    asChild
                >
                    <Link to={editPath}>
                        <SquarePen className="mr-2 h-4 w-4" aria-hidden />
                        Edit sermon
                    </Link>
                </Button>
            </div>
        </div>
    );
}
