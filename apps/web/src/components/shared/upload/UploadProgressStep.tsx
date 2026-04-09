import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileAudio,  Trash2, Loader2, X, Video } from 'lucide-react';
import { useUpload, uploadActions } from '@/context/upload/upload.context';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { backgroundUploadService, UploadTask } from '@/services/background-upload.service';

const UploadProgressStep: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData, progress, uploadComplete, isLoading, backgroundUploadId } = state;
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  useEffect(() => {
    if (!uploadData.file) {
      return;
    }

    let currentUploadId = backgroundUploadId ?? null;
    let serviceTask = currentUploadId ? backgroundUploadService.getUploadStatus(currentUploadId) : null;

    if (currentUploadId && !serviceTask) {
      currentUploadId = null;
      dispatch(uploadActions.setBackgroundUploadId(null));
    }

    if (serviceTask) {
      dispatch(uploadActions.setProgress(serviceTask.progress));
      if (serviceTask.status === 'completed') {
        dispatch(uploadActions.setUploadComplete(true));
        dispatch(uploadActions.setLoading(false));
      } else {
        dispatch(uploadActions.setLoading(true));
      }
    }

    const handleProgress = (id: string, newProgress: number) => {
      if (currentUploadId && id === currentUploadId) {
        dispatch(uploadActions.setProgress(newProgress));
      }
    };

    const handleComplete = (id: string, task: UploadTask) => {
      if (currentUploadId && id === currentUploadId) {
        dispatch(uploadActions.setUploadComplete(true));
        dispatch(uploadActions.setLoading(false));
        dispatch(uploadActions.setProgress(100));
      }
    };

    const handleCancelled = (id: string) => {
      if (currentUploadId && id === currentUploadId) {
        dispatch(uploadActions.setLoading(false));
        dispatch(uploadActions.setProgress(0));
        dispatch(uploadActions.setBackgroundUploadId(null));
      }
    };

    backgroundUploadService.onProgress(handleProgress);
    backgroundUploadService.onComplete(handleComplete);
    backgroundUploadService.onCancelled(handleCancelled);

    if (!currentUploadId && !uploadComplete) {
      const newUploadId = backgroundUploadService.startUpload(uploadData.file);
      dispatch(uploadActions.setBackgroundUploadId(newUploadId));
      dispatch(uploadActions.setLoading(true));
    }

    return () => {
      backgroundUploadService.offProgress(handleProgress);
      backgroundUploadService.offComplete(handleComplete);
      backgroundUploadService.offCancelled(handleCancelled);
    };
  }, [uploadData.file, dispatch, backgroundUploadId, uploadComplete]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRemoveAudio = () => {
    setShowRemoveDialog(true);
  };

  const handleConfirmRemove = () => {
    if (backgroundUploadId) {
      backgroundUploadService.cancelUpload(backgroundUploadId);
      dispatch(uploadActions.setBackgroundUploadId(null));
    }
    // Move to drafts logic would go here
    dispatch(uploadActions.resetUpload());
    setShowRemoveDialog(false);
  };

  const handleCancelRemove = () => {
    setShowRemoveDialog(false);
  };

  const handleCancelUpload = () => {
    if (backgroundUploadId) {
      backgroundUploadService.cancelUpload(backgroundUploadId);
      dispatch(uploadActions.setBackgroundUploadId(null));
    }
    dispatch(uploadActions.setLoading(false));
    dispatch(uploadActions.setProgress(0));
    dispatch(uploadActions.setUploadComplete(false));
    // Optionally reset the file
    // dispatch(uploadActions.setFile(null));
  };

  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration - Audio formats only
  const acceptedTypes = [
    'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav',
    'audio/m4a', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/webm',
    'audio/flac', 'audio/x-flac', 'audio/wma', 'audio/x-ms-wma'
  ];
  
  const acceptedExtensions = [
    '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm', '.flac', '.wma'
  ];
  const maxSize = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    const isValidMimeType = acceptedTypes.includes(fileType) || fileType.startsWith('audio/');
    const isValidExtension = acceptedExtensions.includes(fileExtension);
    
    if (!isValidMimeType && !isValidExtension) {
      return 'Please upload a valid audio file (MP3, WAV, M4A, AAC, OGG, FLAC, etc.)';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }
    
    setValidationError('');
    dispatch(uploadActions.setFile(file));
    
    const fileName = file.name;
    const titleFromFile = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const cleanTitle = titleFromFile
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .trim();
    
    dispatch(uploadActions.setUploadData({ title: cleanTitle }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
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

  if (!uploadData.file) {
    return (
      <div className="h-full flex flex-col">
        <div className="relative flex-1 min-h-0">
          <div 
            className={cn(
              "border-2 border-dashed border-border/50 bg-[#2b2a2c]/70 rounded-xl min-h-[40vh] transition-all duration-200 cursor-pointer flex items-center justify-center",
              isDragActive && "border-primary bg-primary/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
              {/* Upload Icon */}
              <div className="relative">
                <img 
                  src="/images/assets/upload-file.svg" 
                  alt="Upload" 
                  className="h-12 w-12"
                />
              </div>
              
              {/* Upload Text */}
              <div className="text-center">
                <p className="text-base text-white">
                  Drag and drop sermon to upload or select sermon from your device.
                </p>
              </div>
              
              {/* Select Files Button */}
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-[#00C8C8] cursor-pointer hover:bg-[#00B8B8] text-black px-6 py-2 rounded-md font-medium"
              >
                Select files
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {validationError && (
          <div className="relative">
            <div className="flex items-center space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
              <div className="flex-1">
                <p className="text-sm font-medium">{validationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={[...acceptedTypes, ...acceptedExtensions].join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // Check if upload is in progress
  const isUploading = !uploadComplete && isLoading && progress > 0 && progress < 100;

  return (
    <>
      <div className="space-y-6">
        {/* Upload Progress Screen - matches screenshot design */}
        {isUploading && (
          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            {/* Spinner */}
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            
            {/* Uploading text */}
            <h3 className="text-lg font-medium text-foreground">Uploading...</h3>
            
            {/* File name */}
            {uploadData.file && (
              <p className="text-sm text-muted-foreground text-center">
                {uploadData.file.name}
              </p>
            )}
            
            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% completed
              </p>
            </div>
            
            {/* Cancel Upload Button */}
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel upload
            </Button>
          </div>
        )}

        {/* Upload Complete - File Preview Style */}
        {uploadComplete && uploadData.file && (() => {
          // Detect file type based on extension
          const fileName = uploadData.file.name.toLowerCase();
          const isVideoFile = fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.avi') || 
                             fileName.endsWith('.webm') || fileName.endsWith('.mkv');
          
          return (
            <div className="relative border-2 border-dashed border-white/20 rounded-lg overflow-hidden min-h-[250px] flex items-center justify-center">
              {/* Blurred Background - using thumbnail if available, otherwise a placeholder */}
              {uploadData.thumbnailPreview ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center filter blur-md opacity-30"
                  style={{ backgroundImage: `url(${uploadData.thumbnailPreview})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30" />
              )}
              
              {/* Content Overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-4 p-6">
                {/* File Type Icon */}
                {isVideoFile ? (
                  <Video className="h-12 w-12 text-white" />
                ) : (
                  <FileAudio className="h-12 w-12 text-white" />
                )}
                
                {/* File Name */}
                <div className="text-center">
                  <p className="text-white text-lg font-medium">
                    {uploadData.file.name}
                  </p>
                </div>
                
                {/* Remove Button - shows "Remove audio" or "Remove video" based on file type */}
                <Button
                  variant="outline"
                  onClick={handleRemoveAudio}
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isVideoFile ? 'Remove video' : 'Remove audio'}
                </Button>
              </div>
            </div>
          );
        })()}

        {/* File Info - shown when not uploading and not complete */}
        {!isUploading && !uploadComplete && (
          <>
            <div className="border border-border/50 rounded-lg p-6 bg-gradient-to-br from-background to-muted/10">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FileAudio className="h-10 w-10 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground truncate">
                    {uploadData.file.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadData.file.size)} • Audio File
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Uploading...</h4>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              
              <Progress value={progress} className="h-2" />
            </div>
          </>
        )}
      </div>

      {/* Remove Audio Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <span>Remove audio?</span>
            </DialogTitle>
            <DialogDescription>
              This will remove the uploaded audio file and move it to drafts. You can access it later from your drafts folder.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancelRemove}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmRemove}
              className="bg-destructive hover:bg-destructive/90"
            >
              Move to Drafts
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadProgressStep;