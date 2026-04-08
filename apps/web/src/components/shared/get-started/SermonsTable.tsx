import { Button } from "@/components/ui/button";
import { dummySermons } from "@/_data/dummySermons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, Filter, ArrowDown, Grid3X3, List } from "lucide-react";
import SermonsGridView from "../my-sermons/SermonsGridView";
import SermonsListView from "../my-sermons/SermonsListView";

interface SermonsTableProps {
  sermons: typeof dummySermons;
}

const SermonsTable = ({ sermons }: SermonsTableProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All sermons");
  const [selectedSermons, setSelectedSermons] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Context menu handlers
  const handleEdit = (sermonId: string) => {
    console.log("Edit sermon:", sermonId);
    // Add edit functionality here
  };

  const handleRename = (sermonId: string) => {
    console.log("Rename sermon:", sermonId);
    // Add rename functionality here
  };

  const handleDuplicate = (sermonId: string) => {
    console.log("Duplicate sermon:", sermonId);
    // Add duplicate functionality here
  };

  const handleMove = (sermonId: string) => {
    console.log("Move sermon:", sermonId);
    // Add move functionality here
  };

  const handleShare = (sermonId: string) => {
    console.log("Share sermon:", sermonId);
    // Add share functionality here
  };

  const handleDownload = (sermonId: string) => {
    console.log("Download sermon:", sermonId);
    // Add download functionality here
  };

  const handleAnalytics = (sermonId: string) => {
    console.log("View analytics for sermon:", sermonId);
    // Add analytics functionality here
  };

  const handleMoveToTrash = (sermonId: string) => {
    console.log("Move to trash:", sermonId);
    // Add move to trash functionality here
  };

  // Select all functionality
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedSermons(new Set());
      setSelectAll(false);
    } else {
      // Select all visible sermons
      const allSermonIds = new Set(filteredSermons.map((sermon) => sermon.id));
      setSelectedSermons(allSermonIds);
      setSelectAll(true);
    }
  };

  // Individual checkbox handler
  const handleSermonSelect = (sermonId: string) => {
    const newSelected = new Set(selectedSermons);
    if (newSelected.has(sermonId)) {
      newSelected.delete(sermonId);
    } else {
      newSelected.add(sermonId);
    }
    setSelectedSermons(newSelected);

    // Update select all state
    const allSermonIds = new Set(filteredSermons.map((sermon) => sermon.id));
    setSelectAll(
      newSelected.size === allSermonIds.size && allSermonIds.size > 0
    );
  };

  // Filter sermons based on active tab
  const getFilteredSermons = () => {
    if (activeTab === "All sermons") {
      return sermons;
    }
    return sermons.filter((sermon) => {
      switch (activeTab) {
        case "Audio":
          return sermon.type === "audio";
        case "Videos":
          return sermon.type === "video";
        case "Shorts":
          return sermon.type === "short";
        case "Playlists":
          return false; // No playlists in current data
        default:
          return true;
      }
    });
  };

  const filteredSermons = getFilteredSermons();
  const hasFilteredSermons = filteredSermons.length > 0;

  return (
    <div className="bg-neutral-900/60 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-7 flex justify-between">
          <h1 className="text-xl font-semibold text-white mb-4">My Sermons</h1>
          <Button
            onClick={() => navigate("/upload-sermon")}
            className="bg-primary hover:bg-primary/80 text-primary-foreground font-medium px-4 py-2"
          >
            + Create sermon
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-6 mb-6">
          {["All sermons", "Audio", "Videos", "Shorts", "Playlists"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 cursor-pointer text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-white border-b-2 border-primary"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Left Side - Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sermons"
                className="pl-10 pr-4 py-2 bg-transparent border border-muted-foreground/50 rounded-lg  placeholder-muted-foreground w-64"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Right Side - Sort, View Toggle */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <span>Sort</span>
              <ArrowDown className="w-4 h-4" />
            </Button>
            <div className="flex border border-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-l-lg cursor-pointer transition-colors ${
                  viewMode === "grid"
                    ? "bg-muted-foreground/50 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-r-lg cursor-pointer transition-colors ${
                  viewMode === "list"
                    ? "bg-muted-foreground/50 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sermons Content */}
        <div
          className={` rounded-lg overflow-hidden ${
            viewMode === "grid" ? "bg-transparent" : "bg-[#333234]/50"
          }`}
        >
          {hasFilteredSermons ? (
            viewMode === "grid" ? (
              // Grid View
              <SermonsGridView
                sermons={filteredSermons}
                onEdit={handleEdit}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onMove={handleMove}
                onShare={handleShare}
                onDownload={handleDownload}
                onAnalytics={handleAnalytics}
                onMoveToTrash={handleMoveToTrash}
              />
            ) : (
              // List View (Table)
              <SermonsListView
                sermons={filteredSermons}
                selectedSermons={selectedSermons}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onSermonSelect={handleSermonSelect}
                onEdit={handleEdit}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onMove={handleMove}
                onShare={handleShare}
                onDownload={handleDownload}
                onAnalytics={handleAnalytics}
                onMoveToTrash={handleMoveToTrash}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Nothing here
                </h3>
                <p className="text-sm text-muted-foreground">
                  No {activeTab.toLowerCase()} found. Try uploading some content
                  or check other categories.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SermonsTable;
