import { FileEdit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmptyDraftsState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-muted/30 rounded-full">
            <FileEdit className="size-16 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">No drafts yet</h2>
          <p className="text-muted-foreground">
            You do not have any sermon drafts at the moment. Start uploading a
            sermon to create your first draft.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="default"
            size="lg"
            className="gap-2 cursor-pointer"
            onClick={() => navigate('/upload-sermon')}
          >
            <Plus className="size-5" />
            Upload Sermon
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyDraftsState;
