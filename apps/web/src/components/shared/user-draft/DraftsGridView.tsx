import { Music, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Sermon } from '@/types/sermon';

interface DraftsGridViewProps {
  sermons: Sermon[];
  selectedSermons: number[];
  onToggleSelection: (id: number) => void;
}

const DraftsGridView = ({
  sermons,
  selectedSermons,
  onToggleSelection,
}: DraftsGridViewProps) => {
  return (
    <div className="flex-1 overflow-auto rounded-lg p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sermons.map((sermon) => (
          <div
            key={sermon.id}
            className="bg-card rounded-lg border border-border/30 p-4 hover:border-border/60 transition-all hover:shadow-lg group"
          >
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

            <div className="flex items-start gap-3 mb-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <Music className="size-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {sermon.title}
                </h3>
                <p className="text-sm text-muted-foreground">{sermon.duration}</p>
              </div>
            </div>

            <div className="mb-3 pb-3 border-b border-border/30">
              <span className="text-xs text-muted-foreground">
                {sermon.dateCreated}
              </span>
            </div>

            <Button variant="default" size="sm" className="w-full gap-2">
              <Upload className="size-4" />
              Continue Upload
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftsGridView;
