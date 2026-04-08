import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Globe, Lock, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload, uploadActions } from '@/context/upload/upload.context';

const PublishSettings: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData, isLoading } = state;
  
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleVisibilityChange = (isPublic: boolean) => {
    dispatch(uploadActions.setUploadData({ isPublic }));
  };

  const handleScheduleTypeChange = (type: 'now' | 'later') => {
    setScheduleType(type);
    if (type === 'now') {
      dispatch(uploadActions.setUploadData({ scheduledDate: undefined }));
    }
  };

  const handleScheduleChange = () => {
    if (scheduleType === 'later' && scheduledDate && scheduledTime) {
      const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      dispatch(uploadActions.setUploadData({ scheduledDate: dateTime }));
    }
  };

  const handlePublish = async () => {
    dispatch(uploadActions.setLoading(true));
    
    try {
      // Here you would typically upload the file and create the sermon
      // For now, we'll simulate the process
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        dispatch(uploadActions.setProgress(i));
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Clear the draft from localStorage
      localStorage.removeItem('sermon_upload_draft');
      
      // Reset the upload state
      dispatch(uploadActions.resetUpload());
      
      // Navigate to success or dashboard
      // This would typically be handled by the parent component
      console.log('Upload completed successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      dispatch(uploadActions.setLoading(false));
    }
  };

  const isScheduleValid = scheduleType === 'now' || (scheduledDate && scheduledTime);
  const canPublish = uploadData.file && uploadData.title && uploadData.description && isScheduleValid;

  return (
    <div className="space-y-6">
      {/* Upload Summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Upload Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Title:</span>
            <p className="font-medium truncate">{uploadData.title}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <p className="font-medium">{uploadData.category}</p>
          </div>
          <div>
            <span className="text-muted-foreground">File:</span>
            <p className="font-medium truncate">{uploadData.file?.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Tags:</span>
            <p className="font-medium">{uploadData.tags.length} tags</p>
          </div>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Visibility</Label>
        
        <div className="space-y-3">
          <div
            onClick={() => handleVisibilityChange(true)}
            className={cn(
              'flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors',
              uploadData.isPublic ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              uploadData.isPublic ? 'border-primary' : 'border-muted-foreground'
            )}>
              {uploadData.isPublic && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Public</p>
              <p className="text-sm text-muted-foreground">
                Anyone can search for and view this sermon
              </p>
            </div>
          </div>

          <div
            onClick={() => handleVisibilityChange(false)}
            className={cn(
              'flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors',
              !uploadData.isPublic ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              !uploadData.isPublic ? 'border-primary' : 'border-muted-foreground'
            )}>
              {!uploadData.isPublic && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <Lock className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Private</p>
              <p className="text-sm text-muted-foreground">
                Only you and people you choose can view this sermon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Schedule</Label>
        
        <div className="space-y-3">
          <div
            onClick={() => handleScheduleTypeChange('now')}
            className={cn(
              'flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors',
              scheduleType === 'now' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              scheduleType === 'now' ? 'border-primary' : 'border-muted-foreground'
            )}>
              {scheduleType === 'now' && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Publish Now</p>
              <p className="text-sm text-muted-foreground">
                Make this sermon available immediately
              </p>
            </div>
          </div>

          <div
            onClick={() => handleScheduleTypeChange('later')}
            className={cn(
              'flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors',
              scheduleType === 'later' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              scheduleType === 'later' ? 'border-primary' : 'border-muted-foreground'
            )}>
              {scheduleType === 'later' && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Schedule for Later</p>
              <p className="text-sm text-muted-foreground">
                Choose when to make this sermon available
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Date/Time Inputs */}
        {scheduleType === 'later' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-date" className="text-sm">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                onBlur={handleScheduleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-time" className="text-sm">Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                onBlur={handleScheduleChange}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isLoading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{state.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch(uploadActions.setStep('thumbnail'))}
          disabled={isLoading}
        >
          Back to Thumbnail
        </Button>
        
        <Button
          onClick={handlePublish}
          disabled={!canPublish || isLoading}
          className="px-8"
        >
          {isLoading ? 'Publishing...' : scheduleType === 'now' ? 'Publish Now' : 'Schedule Sermon'}
        </Button>
      </div>
    </div>
  );
};

export default PublishSettings;