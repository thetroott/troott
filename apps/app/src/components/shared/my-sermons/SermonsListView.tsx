import { ArrowDown, CirclePlus, Music } from "lucide-react";
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

interface SermonsListViewProps {
  sermons: Sermon[];
  selectedSermons: Set<string>;
  selectAll: boolean;
  onSelectAll: () => void;
  onSermonSelect: (sermonId: string) => void;
  onEdit: (sermonId: string) => void;
  onRename: (sermonId: string) => void;
  onDuplicate: (sermonId: string) => void;
  onMove: (sermonId: string) => void;
  onShare: (sermonId: string) => void;
  onDownload: (sermonId: string) => void;
  onAnalytics: (sermonId: string) => void;
  onMoveToTrash: (sermonId: string) => void;
}

const SermonsListView = ({
  sermons,
  selectedSermons,
  selectAll,
  onSelectAll,
  onSermonSelect,
  onEdit,
  onRename,
  onDuplicate,
  onMove,
  onShare,
  onDownload,
  onAnalytics,
  onMoveToTrash,
}: SermonsListViewProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#333234]/50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                className="rounded cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              Duration
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 flex items-center">
              Date Created
              <ArrowDown className="w-4 h-4 ml-1 text-red-500" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              Plays
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              Comments
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
              Likes & Dislikes
            </th>
            <th className="px-4 py-3 text-left">
              <CirclePlus className="w-4 h-4 text-gray-400" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#333234]">
          {sermons.map((sermon) => (
            <tr key={sermon.id} className="hover:bg-primary/10">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedSermons.has(sermon.id)}
                  onChange={() => onSermonSelect(sermon.id)}
                  className="rounded cursor-pointer"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">{sermon.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-300">{sermon.duration}</td>
              <td className="px-4 py-3 text-gray-300">{sermon.dateCreated}</td>
              <td className="px-4 py-3 text-gray-300">{sermon.plays}</td>
              <td className="px-4 py-3 text-gray-300">{sermon.comments}</td>
              <td className="px-4 py-3 text-gray-300">
                {sermon.likes} Likes ({sermon.dislikes} dislikes)
              </td>
              <td className="px-4 py-3">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SermonsListView;
