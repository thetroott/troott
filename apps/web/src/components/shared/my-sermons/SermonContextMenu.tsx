import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    MoreHorizontal,
    MoreVertical,
    Scissors,
    Pencil,
    Share,
    Download,
    BarChart3,
    Trash2,
    Info,
} from 'lucide-react';
import { MY_SERMONS_LIST } from '@/components/shared/my-sermons/my-sermons-ui';

interface SermonContextMenuProps {
    sermonId: string;
    /** Overrides list row trigger (e.g. grid `#252525` 24×24 chip). */
    triggerClassName?: string;
    /** Grid cards use vertical dots per Figma `ph:dots-three-vertical-bold`. */
    menuIcon?: 'horizontal' | 'vertical';
    onGetInfo?: (sermonId: string) => void;
    onEdit?: (sermonId: string) => void;
    onRename?: (sermonId: string) => void;
    onShare?: (sermonId: string) => void;
    onDownload?: (sermonId: string) => void;
    onAnalytics?: (sermonId: string) => void;
    onMoveToTrash?: (sermonId: string) => void;
    /** When false, **Move to trash** is hidden (e.g. published sermons). */
    canMoveToTrash?: boolean;
}

const SermonContextMenu = ({
    sermonId,
    triggerClassName,
    menuIcon = 'horizontal',
    onGetInfo,
    onEdit,
    onRename,
    onShare,
    onDownload,
    onAnalytics,
    onMoveToTrash,
    canMoveToTrash = true,
}: SermonContextMenuProps) => {
    const handleEdit = () => {
        if (onEdit) {
            onEdit(sermonId);
        } else {
            console.log('Edit sermon:', sermonId);
        }
    };

    const handleRename = () => {
        if (onRename) {
            onRename(sermonId);
        } else {
            console.log('Rename sermon:', sermonId);
        }
    };

    const handleShare = () => {
        if (onShare) {
            onShare(sermonId);
        } else {
            console.log('Share sermon:', sermonId);
        }
    };

    const handleDownload = () => {
        if (onDownload) {
            onDownload(sermonId);
        } else {
            console.log('Download sermon:', sermonId);
        }
    };

    const handleAnalytics = () => {
        if (onAnalytics) {
            onAnalytics(sermonId);
        } else {
            console.log('View analytics for sermon:', sermonId);
        }
    };

    const handleMoveToTrash = () => {
        if (onMoveToTrash) {
            onMoveToTrash(sermonId);
        } else {
            console.log('Move to trash:', sermonId);
        }
    };

    const MenuGlyph = menuIcon === 'vertical' ? MoreVertical : MoreHorizontal;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        triggerClassName ?? MY_SERMONS_LIST.rowActionTrigger,
                    )}
                    aria-label="Sermon actions"
                >
                    <MenuGlyph className="h-4 w-4" strokeWidth={2} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-48 rounded-lg bg-[#333234] text-white"
                align="end"
            >
                {onGetInfo ? (
                    <>
                        <DropdownMenuItem
                            onClick={() => onGetInfo(sermonId)}
                            className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primary/10"
                        >
                            <Info className="h-4 w-4 text-white" />
                            Get info
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-gray-500/30" />
                    </>
                ) : null}

                <DropdownMenuItem
                    onClick={handleEdit}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primary/10"
                >
                    <Scissors className="h-4 w-4 text-white" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleRename}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primary/10"
                >
                    <Pencil className="h-4 w-4 text-white" />
                    Rename
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-gray-500/30" />

                <DropdownMenuItem
                    onClick={handleShare}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primary/10"
                >
                    <Share className="h-4 w-4 text-white" />
                    Share
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDownload}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primary/10"
                >
                    <Download className="h-4 w-4 text-white" />
                    Download
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleAnalytics}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primary/10"
                >
                    <BarChart3 className="h-4 w-4 text-white" />
                    Analytics
                </DropdownMenuItem>

                {onMoveToTrash && canMoveToTrash ? (
                    <>
                        <DropdownMenuSeparator className="my-1 bg-gray-500/30" />
                        <DropdownMenuItem
                            onClick={handleMoveToTrash}
                            className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primary/10"
                        >
                            <Trash2 className="h-4 w-4 text-red-400" />
                            Move to Trash
                        </DropdownMenuItem>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SermonContextMenu;
