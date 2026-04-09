import { Music, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sermon } from '@/types/sermon';

interface DraftsGridViewProps {
  sermons: Sermon[];
  selectedSermons: number[];
  onToggleSelection: (id: number) => void;
  onContinueUpload?: (sermonIndex: number) => void;
  onDeleteDraft?: (sermonIndex: number) => void;
}

const DraftsGridView = ({
  sermons,
  selectedSermons,
  onToggleSelection,
  onContinueUpload,
  onDeleteDraft,
}: DraftsGridViewProps) => {
  return (
    <div className="flex-1 overflow-auto rounded-lg p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sermons.map((sermon, index) => (
          <div
            key={sermon.id}
            className="bg-card rounded-lg border border-border/30 p-4 hover:border-border/60 transition-all hover:shadow-lg group flex flex-col"
          >
            {/* Header with checkbox */}
            <div className="flex items-start justify-between mb-3">
              <input
                type="checkbox"
                checked={selectedSermons.includes(sermon.id)}
                onChange={() => onToggleSelection(sermon.id)}
                className="rounded border-border cursor-pointer mt-1"
              />
              <Badge
                variant="destructive"
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
              >
                {sermon.status}
              </Badge>
            </div>

            {/* Sermon Icon and Title */}
            <div className="flex items-start gap-3 mb-3 flex-1">
              <div className="p-3 bg-muted/50 rounded-lg flex-shrink-0">
                <Music className="size-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {sermon.title}
                </h3>
                <p className="text-sm text-muted-foreground">{sermon.duration}</p>
              </div>
            </div>

            {/* Date */}
            <div className="mb-3 pb-3 border-b border-border/30">
              <span className="text-xs text-muted-foreground">{sermon.dateCreated}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => onContinueUpload?.(index)}
              >
                <Upload className="size-4" />
                Continue
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDeleteDraft?.(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftsGridView;

