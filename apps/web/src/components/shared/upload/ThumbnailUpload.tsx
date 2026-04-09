import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload, uploadActions } from '@/context/upload/upload.context';

const ThumbnailUpload: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    dispatch(uploadActions.setUploadData({ 
      thumbnail: file,
      thumbnailPreview: previewUrl 
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (uploadData.thumbnailPreview) {
      URL.revokeObjectURL(uploadData.thumbnailPreview);
    }
    
    dispatch(uploadActions.setUploadData({ 
      thumbnail: null,
      thumbnailPreview: null 
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateThumbnail = () => {
    // This would typically call an API to generate a thumbnail from the video
    // For now, we'll just show a placeholder
    dispatch(uploadActions.setUploadData({ 
      thumbnailPreview: '/api/placeholder/thumbnail' 
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Sermon Thumbnail
        </Label>
        <p className="text-sm text-muted-foreground">
          Upload a custom thumbnail or generate one from your video. This will be the first thing people see.
        </p>
      </div>

      {/* Current Thumbnail Preview */}
      {uploadData.thumbnailPreview && (
        <div className="relative w-full max-w-md mx-auto">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
            <img
              src={uploadData.thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Options */}
      {!uploadData.thumbnailPreview && (
        <div className="space-y-4">
          {/* Upload Zone */}
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              'hover:border-primary/50 hover:bg-primary/5',
              dragActive && 'border-primary bg-primary/10',
              error && 'border-destructive'
            )}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Upload Custom Thumbnail</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPEG, PNG, WebP • Max 5MB • Recommended: 1280x720px
                </p>
              </div>
            </div>
          </div>

          {/* Generate Option */}
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={generateThumbnail}
              className="mt-4"
              disabled={!uploadData.file}
            >
              <Upload className="h-4 w-4 mr-2" />
              Generate from Video
            </Button>
            
            {!uploadData.file && (
              <p className="text-xs text-muted-foreground mt-2">
                Upload a video first to generate thumbnail
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-destructive text-center">
          {error}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Form Actions */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch(uploadActions.setStep('details'))}
        >
          Back to Details
        </Button>
        
        <Button
          onClick={() => dispatch(uploadActions.setStep('publish'))}
          disabled={!uploadData.thumbnailPreview}
        >
          Continue to Publish
        </Button>
      </div>
    </div>
  );
};

export default ThumbnailUpload;