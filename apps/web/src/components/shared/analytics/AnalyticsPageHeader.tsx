import {
    BarChart3,
    MoreHorizontal,
    Plus,
    Share,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STUDIO_HEADER_ACTION } from '@/components/shared/studio/studio-header-actions';
import { toast } from 'sonner';

interface AnalyticsPageHeaderProps {
    onRefresh?: () => void;
}

export default function AnalyticsPageHeader({
    onRefresh,
}: AnalyticsPageHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[#545454]/50 pb-4">
            <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-[#eaeaea]" aria-hidden />
                <h1 className="text-base font-medium text-[#eaeaea]">
                    Sermon Analytics
                </h1>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-[#bdbdbd]"
                            aria-label="More actions"
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            disabled
                            onSelect={() =>
                                toast.message('Export report is not available yet.')
                            }
                        >
                            Export report
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => {
                                onRefresh?.();
                            }}
                        >
                            Refresh data
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            disabled
                            onSelect={() => toast.message('Help is not available yet.')}
                        >
                            Help
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    type="button"
                    variant="outline"
                    className={STUDIO_HEADER_ACTION.outline}
                    onClick={() =>
                        toast.message('Share is not available yet.')
                    }
                >
                    <Share className="size-4" />
                    Share
                </Button>
                <Button
                    type="button"
                    className={STUDIO_HEADER_ACTION.primary}
                    onClick={() =>
                        toast.message('Create analytics is not available yet.')
                    }
                >
                    <Plus className="size-4" />
                    Create analytics
                </Button>
            </div>
        </div>
    );
}
