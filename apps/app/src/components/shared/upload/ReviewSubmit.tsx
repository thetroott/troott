import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileAudio, Calendar, Globe, Lock, Tag, User, Clock } from 'lucide-react';
import { useUpload, uploadActions } from '@/context/upload/upload.context';

const ReviewSubmit: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData, isLoading } = state;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = () => {
    dispatch(uploadActions.setLoading(true));
    // Here you would typically submit the sermon data to your API
    console.log('Submitting sermon:', uploadData);
    
    // Simulate API call
    setTimeout(() => {
      dispatch(uploadActions.setLoading(false));
      // Reset form or redirect to success page
      alert('Sermon uploaded successfully!');
    }, 2000);
  };

  const handleSaveDraft = () => {
    // Save to drafts logic
    console.log('Saving to drafts:', uploadData);
    alert('Sermon saved to drafts!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <FileAudio className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Review & Submit</h2>
        </div>
        <p className="text-muted-foreground">
          Review your sermon details before publishing
        </p>
      </div>

      {/* File Information */}
      <div className="border border-border/50 rounded-lg p-6 bg-gradient-to-br from-background to-muted/10">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <FileAudio className="h-5 w-5" />
          <span>Audio File</span>
        </h3>
        
        {uploadData.file && (
          <div className="space-y-2">
            <p className="font-medium text-foreground">{uploadData.file.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(uploadData.file.size)} • Audio File
            </p>
          </div>
        )}
      </div>

      {/* Sermon Details */}
      <div className="border border-border/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Sermon Details</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Title</label>
            <p className="text-foreground">{uploadData.title || 'No title provided'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-foreground">{uploadData.description || 'No description provided'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <p className="text-foreground capitalize">
              {uploadData.category ? uploadData.category.replace('-', ' ') : 'No category selected'}
            </p>
          </div>
          
          {uploadData.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {uploadData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      {uploadData.thumbnailPreview && (
        <div className="border border-border/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Thumbnail</h3>
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-border/50">
            <img 
              src={uploadData.thumbnailPreview} 
              alt="Sermon thumbnail" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Settings Summary */}
      <div className="border border-border/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Publishing Settings</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {uploadData.isPublic ? (
              <>
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-foreground">Public - Anyone can discover this sermon</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-orange-600" />
                <span className="text-foreground">Private - Only you can access this sermon</span>
              </>
            )}
          </div>
          
          {uploadData.scheduledDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-foreground">
                Scheduled for: {uploadData.scheduledDate.toLocaleDateString()} at {uploadData.scheduledDate.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          {!uploadData.scheduledDate && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-foreground">Will be published immediately</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button 
          variant="outline" 
          onClick={handleSaveDraft}
          className="flex-1"
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        
        <Button 
          onClick={handleSubmit}
          className="flex-1"
          disabled={isLoading || !uploadData.file || !uploadData.title}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Publishing...
            </>
          ) : (
            uploadData.scheduledDate ? 'Schedule Sermon' : 'Publish Sermon'
          )}
        </Button>
      </div>
      
      {(!uploadData.file || !uploadData.title) && (
        <p className="text-sm text-muted-foreground text-center">
          Please ensure you have uploaded a file and provided a title before publishing.
        </p>
      )}
    </div>
  );
};

export default ReviewSubmit;