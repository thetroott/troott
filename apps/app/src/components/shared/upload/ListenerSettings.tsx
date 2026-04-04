import React from 'react';
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
import { Users, Globe, Volume2 } from 'lucide-react';

const ListenerSettings: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData } = state;

  const handleInputChange = (field: string, value: any) => {
    dispatch(uploadActions.setUploadData({ [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Listener Settings</h2>
        </div>
        <p className="text-muted-foreground">
          Configure how listeners can interact with your sermon
        </p>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Privacy & Visibility</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-base font-medium">Public Sermon</Label>
                <p className="text-sm text-muted-foreground">
                  Anyone can discover and listen to this sermon
                </p>
              </div>
              <Switch
                checked={uploadData.isPublic ?? true}
                onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-base font-medium">Scheduled Publishing</Label>
                <p className="text-sm text-muted-foreground">
                  Set a specific date and time to publish this sermon
                </p>
              </div>
              <Switch
                checked={!!uploadData.scheduledDate}
                onCheckedChange={(checked) => handleInputChange('scheduledDate', checked ? new Date() : null)}
              />
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Audio Settings</span>
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 border border-border/50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-base font-medium">Audio Quality</Label>
                <p className="text-sm text-muted-foreground">
                  Choose the audio quality for streaming
                </p>
                <Select
                  value="high"
                  onValueChange={(value) => console.log('Audio quality:', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audio quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (64 kbps)</SelectItem>
                    <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                    <SelectItem value="high">High (320 kbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Content Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={uploadData.category || ''}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sermon category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday-service">Sunday Service</SelectItem>
                  <SelectItem value="bible-study">Bible Study</SelectItem>
                  <SelectItem value="prayer-meeting">Prayer Meeting</SelectItem>
                  <SelectItem value="youth-service">Youth Service</SelectItem>
                  <SelectItem value="special-event">Special Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Additional Settings</h3>
          
          <div className="space-y-4">
            <div className="p-4 border border-border/50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-base font-medium">Tags</Label>
                <p className="text-sm text-muted-foreground">
                  Current tags: {uploadData.tags.length > 0 ? uploadData.tags.join(', ') : 'No tags added'}
                </p>
              </div>
            </div>

            {uploadData.scheduledDate && (
              <div className="p-4 border border-border/50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Scheduled Date</Label>
                  <p className="text-sm text-muted-foreground">
                    This sermon will be published on: {uploadData.scheduledDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListenerSettings;