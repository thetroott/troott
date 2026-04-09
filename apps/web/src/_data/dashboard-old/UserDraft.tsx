import { useState } from 'react';
import { Search, Filter, ArrowUpDown, Grid3x3, List, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DraftsTableView from '@/components/shared/user-draft/DraftsTableView';
import DraftsGridView from '@/components/shared/user-draft/DraftsGridView';
import EmptyDraftsState from '@/components/shared/user-draft/EmptyDraftsState';
import type { Sermon } from '@/types/sermon';

const mockDraftSermons: Sermon[] = [];

const UserDraft = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSermons, setSelectedSermons] = useState<number[]>([]);

  const toggleSermonSelection = (id: number) => {
    setSelectedSermons((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedSermons.length === mockDraftSermons.length) {
      setSelectedSermons([]);
    } else {
      setSelectedSermons(mockDraftSermons.map((s) => s.id));
    }
  };

  const hasDrafts = mockDraftSermons.length > 0;

  return (
    <div className="flex flex-col h-full space-y-4 py-4">
      {hasDrafts ? (
        <>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  type="text"
                  placeholder="Search sermons"
                  className="pl-9 bg-input/30 border-border/50 h-9"
                />
              </div>

              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="size-4" />
                Filters
                <ChevronDown className="size-3" />
              </Button>

              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="size-4" />
                Sort
                <ChevronDown className="size-3" />
              </Button>
            </div>

            <div className="flex items-center gap-1 border border-border/50 rounded-md p-0.5 bg-muted/30">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('list')}
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <DraftsTableView
              sermons={mockDraftSermons}
              selectedSermons={selectedSermons}
              onToggleSelection={toggleSermonSelection}
              onToggleAllSelection={toggleAllSelection}
            />
          ) : (
            <DraftsGridView
              sermons={mockDraftSermons}
              selectedSermons={selectedSermons}
              onToggleSelection={toggleSermonSelection}
            />
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="size-4" />
              </Button>
              <Select defaultValue="1">
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              1-{mockDraftSermons.length} of {mockDraftSermons.length}
            </div>
          </div>
        </>
      ) : (
        <EmptyDraftsState />
      )}
    </div>
  );
};

export default UserDraft;
