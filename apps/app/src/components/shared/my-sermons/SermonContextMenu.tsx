import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Scissors,
  Pencil,
  Copy,
  Move,
  Share,
  Download,
  BarChart3,
  Trash2,
} from "lucide-react";

interface SermonContextMenuProps {
  sermonId: string;
  onEdit?: (sermonId: string) => void;
  onRename?: (sermonId: string) => void;
  onDuplicate?: (sermonId: string) => void;
  onMove?: (sermonId: string) => void;
  onShare?: (sermonId: string) => void;
  onDownload?: (sermonId: string) => void;
  onAnalytics?: (sermonId: string) => void;
  onMoveToTrash?: (sermonId: string) => void;
}

const SermonContextMenu = ({
  sermonId,
  onEdit,
  onRename,
  onDuplicate,
  onMove,
  onShare,
  onDownload,
  onAnalytics,
  onMoveToTrash,
}: SermonContextMenuProps) => {
  // Default handlers if none provided
  const handleEdit = () => {
    if (onEdit) {
      onEdit(sermonId);
    } else {
      console.log("Edit sermon:", sermonId);
    }
  };

  const handleRename = () => {
    if (onRename) {
      onRename(sermonId);
    } else {
      console.log("Rename sermon:", sermonId);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(sermonId);
    } else {
      console.log("Duplicate sermon:", sermonId);
    }
  };

  const handleMove = () => {
    if (onMove) {
      onMove(sermonId);
    } else {
      console.log("Move sermon:", sermonId);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(sermonId);
    } else {
      console.log("Share sermon:", sermonId);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(sermonId);
    } else {
      console.log("Download sermon:", sermonId);
    }
  };

  const handleAnalytics = () => {
    if (onAnalytics) {
      onAnalytics(sermonId);
    } else {
      console.log("View analytics for sermon:", sermonId);
    }
  };

  const handleMoveToTrash = () => {
    if (onMoveToTrash) {
      onMoveToTrash(sermonId);
    } else {
      console.log("Move to trash:", sermonId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer hover:bg-gray-700/50 rounded p-1 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 bg-[#333234] text-white rounded-lg  "
        align="end"
      >
        {/* First Group: Edit, Rename, Duplicate, Move */}
        <DropdownMenuItem
          onClick={handleEdit}
          className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 px-3 py-2"
        >
          <Scissors className="w-4 h-4 text-white" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-500/30 my-1" />
        <DropdownMenuItem
          onClick={handleRename}
          className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 px-3 py-2"
        >
          <Pencil className="w-4 h-4 text-white" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDuplicate}
          className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 px-3 py-2"
        >
          <Copy className="w-4 h-4 text-white" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleMove}
          className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 px-3 py-2"
        >
          <Move className="w-4 h-4 text-white" />
          Move
        </DropdownMenuItem>

        {/* First Separator */}
        <DropdownMenuSeparator className="bg-gray-500/30 my-1" />

        {/* Second Group: Share, Download, Analytics */}
        <DropdownMenuItem
          onClick={handleShare}
          className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 px-3 py-2"
        >
          <Share className="w-4 h-4 text-white" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDownload}
          className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 px-3 py-2"
        >
          <Download className="w-4 h-4 text-white" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleAnalytics}
          className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 px-3 py-2"
        >
          <BarChart3 className="w-4 h-4 text-white" />
          Analytics
        </DropdownMenuItem>

        {/* Second Separator */}
        <DropdownMenuSeparator className="bg-gray-500/30 my-1" />

        {/* Third Group: Move to Trash */}
        <DropdownMenuItem
          onClick={handleMoveToTrash}
          className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 px-3 py-2"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
          Move to Trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SermonContextMenu;
