import { ChevronDown } from 'lucide-react';
import type { Sermon } from '@/_data/dummySermons';
import { cn } from '@/lib/utils';
import { MY_SERMONS_LIST } from '@/components/shared/my-sermons/my-sermons-ui';
import {
    isUploadStatusBlockingVisibilityChange,
    visibilityLabel,
} from '@/utils/sermon-visibility.util';

type SermonVisibilityCellProps = {
    sermon: Sermon;
    onOpenChange: (sermon: Sermon) => void;
    disabled?: boolean;
    disabledReason?: string;
};

export function SermonVisibilityCell({
    sermon,
    onOpenChange,
    disabled = false,
    disabledReason,
}: SermonVisibilityCellProps) {
    const visibility = sermon.visibility ?? 'public';
    const label = visibilityLabel(visibility);
    const pipelineBlocked = isUploadStatusBlockingVisibilityChange(
        sermon.uploadStatus,
    );
    const isDisabled = disabled || pipelineBlocked;
    const title = pipelineBlocked
        ? 'Finish processing before changing visibility'
        : disabledReason;

    return (
        <div className="inline-flex min-w-0 max-w-full items-center gap-1">
            <span className={cn(MY_SERMONS_LIST.stat, 'truncate')}>
                {label}
            </span>
            <div
                className={cn(
                    MY_SERMONS_LIST.rowQuickActionsWrap,
                    'focus-within:opacity-100',
                    isDisabled && 'pointer-events-none opacity-0',
                )}
            >
                <button
                    type="button"
                    className={cn(
                        MY_SERMONS_LIST.rowQuickActionBtn,
                        isDisabled && 'cursor-not-allowed opacity-50',
                    )}
                    aria-label={`Change visibility for ${sermon.name}`}
                    title={title}
                    disabled={isDisabled}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) {
                            onOpenChange(sermon);
                        }
                    }}
                >
                    <ChevronDown
                        className="h-4 w-4"
                        strokeWidth={2}
                        aria-hidden
                    />
                </button>
            </div>
        </div>
    );
}
