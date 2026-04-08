import { useState, useRef, useEffect } from 'react';
import { Music, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Sermon } from '@/types/sermon';

interface DraftsTableViewProps {
  sermons: Sermon[];
  selectedSermons: number[];
  onToggleSelection: (id: number) => void;
  onToggleAllSelection: () => void;
}

const DraftsTableView = ({
  sermons,
  selectedSermons,
  onToggleSelection,
  onToggleAllSelection,
}: DraftsTableViewProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollTop > 0);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto rounded-lg border border-border/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <table className="w-full">
        <thead
          className={`sticky top-0 z-10 transition-all duration-200 ${
            isScrolled
              ? 'bg-neutral-900/95 backdrop-blur-md shadow-md'
              : 'bg-muted/30'
          }`}
        >
          <tr className="border-b border-border/30">
            <th className="text-left py-3 px-4 w-12">
              <input
                type="checkbox"
                checked={
                  sermons.length > 0 &&
                  selectedSermons.length === sermons.length
                }
                onChange={onToggleAllSelection}
                className="rounded border-border cursor-pointer"
              />
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Sermon
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Date Created
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-right py-3 px-4 w-40"></th>
          </tr>
        </thead>
        <tbody>
          {sermons.map((sermon) => (
            <tr
              key={sermon.id}
              className="border-b border-border/20 hover:bg-muted/20 transition-colors"
            >
              <td className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedSermons.includes(sermon.id)}
                  onChange={() => onToggleSelection(sermon.id)}
                  className="rounded border-border cursor-pointer"
                />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted/50 rounded">
                    <Music className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {sermon.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sermon.duration}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-foreground">
                {sermon.dateCreated}
              </td>
              <td className="py-3 px-4">
                <Badge
                  variant="destructive"
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                >
                  {sermon.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right">
                <Button variant="default" size="sm" className="gap-2">
                  <Upload className="size-4" />
                  Continue Upload
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DraftsTableView;
