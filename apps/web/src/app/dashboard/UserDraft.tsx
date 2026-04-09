import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Grid3x3, List, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DraftsTableView from '@/components/shared/dashboard/DraftsTableView';
import DraftsGridView from '@/components/shared/dashboard/DraftsGridView';

import { useDraft } from '@/context/draft/draft.context';
import { useUpload, uploadActions } from '@/context/upload/upload.context';
import { toast } from 'sonner';
import type { Sermon } from '@/types/sermon';
import EmptyDraftsState from '@/components/shared/user-draft/EmptyDraftsState';

const UserDraft = () => {
  const { state: draftState, fetchDrafts, deleteDraft } = useDraft();
  const { dispatch: uploadDispatch } = useUpload();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSermons, setSelectedSermons] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch drafts on component mount
  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Transform drafts to Sermon type for display
  const drafts: Sermon[] = draftState.drafts.map((draft) => ({
    id: draft.draftId ? parseInt(draft.draftId, 10) : Math.random() * 1000,
    title: draft.title,
    duration: '—', // Duration not available for drafts
    dateCreated: draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : new Date().toLocaleDateString(),
    status: 'Draft' as const,
    plays: 0,
    comments: 0,
    likes: 0,
    avatar: '',
  }));

  // Filter drafts by search query
  const filteredDrafts = drafts.filter((sermon) =>
    sermon.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSermonSelection = (id: number) => {
    setSelectedSermons(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedSermons.length === filteredDrafts.length) {
      setSelectedSermons([]);
    } else {
      setSelectedSermons(filteredDrafts.map(s => s.id));
    }
  };

  // Handle continue upload - load draft into upload context
  const handleContinueUpload = async (sermonIndex: number) => {
    const draft = draftState.drafts[sermonIndex];
    if (!draft) return;

    // Load draft data into upload context
    uploadDispatch(
      uploadActions.loadFromDraft({
        title: draft.title,
        description: draft.description,
        tags: draft.tags || [],
        category: draft.category,
        isPublic: draft.isPublic,
        scheduledDate: draft.scheduledDate,
        seriesId: draft.seriesId,
        draftId: draft.draftId,
      })
    );

    // Navigate to upload screen
    navigate('/upload');
    toast.success('Draft loaded successfully', {
      description: 'Continue editing your sermon.',
    });
  };

  // Handle delete draft
  const handleDeleteDraft = async (sermonIndex: number) => {
    const draft = draftState.drafts[sermonIndex];
    if (!draft.draftId) return;

    try {
      await deleteDraft(draft.draftId);
      toast.success('Draft deleted', {
        description: 'Your draft has been removed.',
      });
    } catch (error) {
      toast.error('Failed to delete draft', {
        description: 'Please try again.',
      });
    }
  };

  // Check if there are no drafts
  const hasDrafts = filteredDrafts.length > 0;

  if (draftState.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-muted-foreground">Loading drafts...</p>
        </div>
      </div>
    );
  }

  if (draftState.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error: {draftState.error}</p>
          <Button onClick={() => fetchDrafts()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 py-4">
      {hasDrafts ? (
        <>
          {/* Header Section */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  type="text"
                  placeholder="Search sermons"
                  className="pl-9 bg-input/30 border-border/50 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="size-4" />
                Filters
                <ChevronDown className="size-3" />
              </Button>

              {/* Sort */}
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="size-4" />
                Sort
                <ChevronDown className="size-3" />
              </Button>
            </div>

            {/* View Toggle */}
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

          {/* Content - Toggle between Table and Grid View */}
          {viewMode === 'list' ? (
            <DraftsTableView
              sermons={filteredDrafts}
              selectedSermons={selectedSermons}
              onToggleSelection={toggleSermonSelection}
              onToggleAllSelection={toggleAllSelection}
              onContinueUpload={handleContinueUpload}
              onDeleteDraft={handleDeleteDraft}
            />
          ) : (
            <DraftsGridView
              sermons={filteredDrafts}
              selectedSermons={selectedSermons}
              onToggleSelection={toggleSermonSelection}
              onContinueUpload={handleContinueUpload}
              onDeleteDraft={handleDeleteDraft}
            />
          )}

          {/* Pagination Section */}
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
              1-{filteredDrafts.length} of {draftState.drafts.length}
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
