import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CloudUpload, ArrowUp, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload, uploadActions } from '@/context/upload/upload.context';

const FileUploadZone: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData, isLoading } = state;
  
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration - Audio formats only
  const acceptedTypes = [
    'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav',
    'audio/m4a', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/webm',
    'audio/flac', 'audio/x-flac', 'audio/wma', 'audio/x-ms-wma'
  ];
  
  // File extensions for better browser compatibility
  const acceptedExtensions = [
    '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm', '.flac', '.wma'
  ];
  const maxSize = 100 * 1024 * 1024; // 100MB (reduced for audio files)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    
    // Check file type - audio only
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
    
    // Auto-fill title based on filename (without extension)
    const fileName = file.name;
    const titleFromFile = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    // Clean up the title: replace underscores/hyphens with spaces and capitalize words
    const cleanTitle = titleFromFile
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .trim();
    
    // Always set title when a new file is selected
    dispatch(uploadActions.setUploadData({ title: cleanTitle }));
    
    // Automatically start upload process
    setTimeout(() => {
      dispatch(uploadActions.setStep('progress'));
    }, 500); // Small delay for better UX
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

  const hasError = validationError;

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      {!uploadData.file && (
        <div className="relative">
          <div 
            className={cn(
              "border-2 border-dashed border-border/50 rounded-2xl p-12 transition-all duration-200 cursor-pointer",
              isDragActive && "border-primary bg-primary/5",
              isLoading && "pointer-events-none opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Cloud Upload Icon */}
              <div className="relative text-muted-foreground">
                <div className="relative">
                  <CloudUpload className="h-12 w-12" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ArrowUp className="h-4 w-4 text-background" />
                  </div>
                </div>
              </div>
              
              {/* Upload Text */}
              <div className="text-center space-y-2">
                <p className="text-lg text-foreground">
                  Drag and drop audio sermon to upload or select
                </p>
                <p className="text-lg text-foreground">
                  audio file from your device.
                </p>
                <p className="text-sm text-muted-foreground">
                  Supported formats: MP3, WAV, M4A, AAC, FLAC
                </p>
              </div>
              
              {/* Select Files Button */}
              <Button 
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Select audio file'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Continue to Upload Button */}
      {uploadData.file && !hasError && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={() => dispatch(uploadActions.setStep('progress'))}
            size="lg"
            className="px-12 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            Continue to Upload
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Error Display */}
      {hasError && (
        <div className="relative">
          <div className="flex items-center space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
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
};

export default FileUploadZone;