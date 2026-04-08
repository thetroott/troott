import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Upload as UploadIcon, Plus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload, uploadActions } from '@/context/upload/upload.context';
import type { IUploadFormErrors } from '@/utils/interfaces.util';

const SermonDetailsForm: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData, errors } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [localData, setLocalData] = useState({
    title: uploadData.title || '',
    description: uploadData.description || '',
    category: uploadData.category || '',
  });
  
  const [localErrors, setLocalErrors] = useState<IUploadFormErrors>({});
  const [dragActive, setDragActive] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string>('');
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [tags, setTags] = useState<string[]>(uploadData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    uploadData.scheduledDate ? uploadData.scheduledDate.toISOString().split('T')[0] : ''
  );

  const validateForm = (): IUploadFormErrors => {
    const newErrors: IUploadFormErrors = {};
    
    if (!localData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (localData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (localData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!localData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (localData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (localData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    if (!localData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    return newErrors;
  };

  const handleInputChange = (field: keyof typeof localData, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    
    // Clear error immediately when user starts typing
    if (localErrors[field] || errors[field]) {
      setLocalErrors(prev => ({ ...prev, [field]: undefined }));
      // Also clear from context errors
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      dispatch(uploadActions.setErrors(updatedErrors));
    }
    
    // Update context
    dispatch(uploadActions.setUploadData({ [field]: value }));
  };

  const handleBlur = (field?: keyof typeof localData) => {
    if (field) {
      const fieldValidation = validateField(field);
      if (fieldValidation) {
        setLocalErrors(prev => ({ ...prev, [field]: fieldValidation }));
        dispatch(uploadActions.setErrors({ ...errors, [field]: fieldValidation }));
      }
    } else {
      // Full validation (used by form submission)
      const validationErrors = validateForm();
      setLocalErrors(validationErrors);
      dispatch(uploadActions.setErrors(validationErrors));
    }
  };

  const validateField = (field: keyof typeof localData): string | undefined => {
    switch (field) {
      case 'title':
        if (!localData.title.trim()) {
          return 'Title is required';
        } else if (localData.title.length < 3) {
          return 'Title must be at least 3 characters';
        } else if (localData.title.length > 100) {
          return 'Title must be less than 100 characters';
        }
        break;
      case 'description':
        if (!localData.description.trim()) {
          return 'Description is required';
        } else if (localData.description.length < 10) {
          return 'Description must be at least 10 characters';
        } else if (localData.description.length > 1000) {
          return 'Description must be less than 1000 characters';
        }
        break;
      case 'category':
        if (!localData.category.trim()) {
          return 'Category is required';
        }
        break;
    }
    return undefined;
  };

  const validateThumbnailFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }
    
    return null;
  };

  const handleThumbnailSelect = (file: File) => {
    const validationError = validateThumbnailFile(file);
    if (validationError) {
      setThumbnailError(validationError);
      return;
    }
    
    setThumbnailError('');
    const previewUrl = URL.createObjectURL(file);
    
    dispatch(uploadActions.setUploadData({ 
      thumbnail: file,
      thumbnailPreview: previewUrl 
    }));
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleThumbnailDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleThumbnailSelect(files[0]);
    }
  };

  const handleThumbnailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleThumbnailSelect(files[0]);
    }
  };

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleThumbnailRemove = () => {
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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      dispatch(uploadActions.setUploadData({ tags: newTags }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    dispatch(uploadActions.setUploadData({ tags: newTags }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleScheduledDateChange = (value: string) => {
    setScheduledDate(value);
    const date = value ? new Date(value) : null;
    dispatch(uploadActions.setUploadData({ scheduledDate: date }));
  };

  const handleShowMore = () => {
    setShowMoreFields(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Form Fields */}
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={localData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            placeholder="Enter sermon title"
            className={cn(
              localErrors.title || errors.title ? 'border-red-500' : ''
            )}
          />
          {(localErrors.title || errors.title) && (
            <p className="text-sm text-red-500">{localErrors.title || errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            value={localData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="Enter sermon description"
            rows={4}
            className={cn(
              "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
              localErrors.description || errors.description ? 'border-red-500' : ''
            )}
          />
          {(localErrors.description || errors.description) && (
            <p className="text-sm text-red-500">{localErrors.description || errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={localData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            onBlur={() => handleBlur('category')}
            placeholder="Enter sermon category"
            className={cn(
              localErrors.category || errors.category ? 'border-red-500' : ''
            )}
          />
          {(localErrors.category || errors.category) && (
            <p className="text-sm text-red-500">{localErrors.category || errors.category}</p>
          )}
        </div>

        {/* Show More Button */}
        {!showMoreFields && (
          <Button
            type="button"
            variant="outline"
            onClick={handleShowMore}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Show More Fields
          </Button>
        )}

        {/* Additional Fields */}
        {showMoreFields && (
          <div className="space-y-6 pt-4 border-t">
            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
              <div className="relative">
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => handleScheduledDateChange(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to publish immediately
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Thumbnail Upload */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Thumbnail (Optional)</Label>
          
          {uploadData.thumbnailPreview ? (
            <div className="relative">
              <img
                src={uploadData.thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleThumbnailRemove}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
              onDragOver={handleThumbnailDragOver}
              onDragLeave={handleThumbnailDragLeave}
              onDrop={handleThumbnailDrop}
              onClick={handleThumbnailClick}
            >
              <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
          )}
          
          {thumbnailError && (
            <p className="text-sm text-red-500">{thumbnailError}</p>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleThumbnailInputChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default SermonDetailsForm;