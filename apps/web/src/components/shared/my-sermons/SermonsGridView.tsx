import { Music } from "lucide-react";
import SermonContextMenu from "./SermonContextMenu";

interface Sermon {
  id: string;
  name: string;
  duration: string;
  dateCreated: string;
  plays: number;
  comments: number;
  likes: number;
  dislikes: number;
  type: "audio" | "video" | "short";
}

interface SermonsGridViewProps {
  sermons: Sermon[];
  onEdit: (sermonId: string) => void;
  onRename: (sermonId: string) => void;
  onDuplicate: (sermonId: string) => void;
  onMove: (sermonId: string) => void;
  onShare: (sermonId: string) => void;
  onDownload: (sermonId: string) => void;
  onAnalytics: (sermonId: string) => void;
  onMoveToTrash: (sermonId: string) => void;
}

const SermonsGridView = ({
  sermons,
  onEdit,
  onRename,
  onDuplicate,
  onMove,
  onShare,
  onDownload,
  onAnalytics,
  onMoveToTrash,
}: SermonsGridViewProps) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sermons.map((sermon) => (
          <div key={sermon.id} className="group relative">
            <div className="bg-[#2a2a2a] rounded-lg overflow-hidden hover:bg-[#333333] transition-colors">
              {/* Thumbnail/Icon Area */}
              <div className="relative aspect-video bg-[#1a1a1a] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Music className="w-4 h-4 text-gray-400" />
                </div>

                {/* Duration overlay */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {sermon.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
                  {sermon.name}
                </h3>
                <p className="text-gray-400 text-xs">{sermon.dateCreated}</p>

                {/* Stats */}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>{sermon.plays} plays</span>
                  <span>{sermon.likes} likes</span>
                </div>
              </div>

              {/* Context Menu */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <SermonContextMenu
                  sermonId={sermon.id}
                  onEdit={onEdit}
                  onRename={onRename}
                  onDuplicate={onDuplicate}
                  onMove={onMove}
                  onShare={onShare}
                  onDownload={onDownload}
                  onAnalytics={onAnalytics}
                  onMoveToTrash={onMoveToTrash}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SermonsGridView;
