import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpload, uploadActions } from '@/context/upload/upload.context';

const ListenerSettings: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData } = state;
  
  // Local state for interaction settings
  const [allowComments, setAllowComments] = useState(false);
  const [showViewerLikes, setShowViewerLikes] = useState(false);
  
  // Visibility options: public, unlisted, private
  const [visibility, setVisibility] = useState<string>(
    uploadData.isPublic === true ? 'public' : 
    uploadData.isPublic === false ? 'private' : 
    'public'
  );

  const handleVisibilityChange = (value: string) => {
    setVisibility(value);
    if (value === 'public') {
      dispatch(uploadActions.setUploadData({ isPublic: true }));
    } else if (value === 'private') {
      dispatch(uploadActions.setUploadData({ isPublic: false }));
    } else if (value === 'unlisted') {
      // Unlisted means not searchable but accessible via link
      dispatch(uploadActions.setUploadData({ isPublic: false }));
    }
  };

  const handleCommentsChange = (checked: boolean) => {
    setAllowComments(checked);
    // You can dispatch this to upload context if needed
    // dispatch(uploadActions.setUploadData({ allowComments: checked }));
  };

  const handleViewerLikesChange = (checked: boolean) => {
    setShowViewerLikes(checked);
    // You can dispatch this to upload context if needed
    // dispatch(uploadActions.setUploadData({ showViewerLikes: checked }));
  };

  return (
    <div className="space-y-4 w-full">
      {/* Access Section */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Access</h3>
        <p className="text-sm text-muted-foreground">
          Choose when to publish and who can listen to your sermon.
        </p>
        <Select value={visibility} onValueChange={handleVisibilityChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Make your sermon public, or private." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="unlisted">Unlisted</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interaction Settings */}
      <div className="space-y-3">
        {/* Allow Comments Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Allow people to comment</Label>
          <Switch
            checked={allowComments}
            onCheckedChange={handleCommentsChange}
          />
        </div>

        {/* Show Viewer Likes Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Show how many listeners like the content</Label>
          <Switch
            checked={showViewerLikes}
            onCheckedChange={handleViewerLikesChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ListenerSettings;