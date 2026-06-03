import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Info, MoreVertical, RotateCcw, Trash2 } from 'lucide-react';
import { MY_SERMONS_LIST } from '@/components/shared/my-sermons/my-sermons-ui';

interface BinContextMenuProps {
    sermonId: string;
    triggerClassName?: string;
    onGetInfo?: (sermonId: string) => void;
    onRestore?: (sermonId: string) => void;
    onEmptyImmediately?: (sermonId: string) => void;
    /** When false, **Empty immediately** is hidden (published sermons). */
    canPermanentlyDelete?: boolean;
}

const BinContextMenu = ({
    sermonId,
    triggerClassName,
    onGetInfo,
    onRestore,
    onEmptyImmediately,
    canPermanentlyDelete = true,
}: BinContextMenuProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        triggerClassName ?? MY_SERMONS_LIST.rowActionTrigger,
                    )}
                    aria-label="Bin sermon actions"
                >
                    <MoreVertical className="h-4 w-4" strokeWidth={2} />
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
                    onClick={() => onRestore?.(sermonId)}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primary/10"
                >
                    <RotateCcw className="h-4 w-4 text-white" />
                    Restore
                </DropdownMenuItem>
                {onEmptyImmediately && canPermanentlyDelete ? (
                    <>
                        <DropdownMenuSeparator className="my-1 bg-gray-500/30" />
                        <DropdownMenuItem
                            onClick={() => onEmptyImmediately(sermonId)}
                            className="flex cursor-pointer items-center gap-3 px-3 py-2 text-red-400 hover:bg-primary/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            Empty immediately
                        </DropdownMenuItem>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default BinContextMenu;
