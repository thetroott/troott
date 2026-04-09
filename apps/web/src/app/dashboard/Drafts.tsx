
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileAudio, Calendar, Tag, Trash2, Edit, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDraft, IDraft } from '@/context/draft/draft.context';

const Drafts = () => {
  const { state, fetchDrafts, deleteDraft } = useDraft();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Function to load a draft and navigate to upload page
  const handleEditDraft = (draft: IDraft) => {
    // Pass draft data through navigation state
    const draftData = {
      draftId: draft.id,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      tags: draft.tags || [],
      isPublic: draft.isPublic,
      scheduledDate: draft.scheduledDate,
      seriesId: draft.seriesId,
    };
    
    navigate('/upload-sermon', {
      state: { draftData },
    });
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    setIsDeleting(draftId);
    try {
      await deleteDraft(draftId);
      toast.success('Draft deleted', {
        description: 'The draft has been deleted successfully.',
      });
    } catch (error: any) {
      toast.error('Failed to delete draft', {
        description: error?.message || 'Please try again.',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'No date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isLoading = state.isLoading;
  const drafts = state.drafts;

  return (
    <div className="w-full h-full flex flex-col space-y-6 py-8 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Drafts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Button
          onClick={() => navigate('/upload-sermon')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Sermon
        </Button>
      </div>

      {/* Error State */}
      {state.error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Error loading drafts</p>
            <p className="text-sm text-muted-foreground">{state.error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : drafts.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted rounded-full p-4 mb-4">
            <FileAudio className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No drafts yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Start by uploading a sermon. You can save it as a draft and continue editing later.
          </p>
          <Button
            onClick={() => navigate('/upload-sermon')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Your First Draft
          </Button>
        </div>
      ) : (
        // Drafts List
        <div className="grid grid-cols-1 gap-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Draft Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEditDraft(draft)}>
                  <h3 className="font-semibold text-foreground truncate hover:text-primary">
                    {draft.title || 'Untitled Sermon'}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {draft.description || 'No description'}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-muted-foreground">
                    {draft.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {draft.category}
                      </div>
                    )}
                    {draft.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(draft.createdAt)}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {draft.tags && draft.tags.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {draft.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {draft.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{draft.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditDraft(draft)}
                    className="h-9 px-3 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(draft.id)}
                    disabled={isDeleting === draft.id}
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Drafts;
