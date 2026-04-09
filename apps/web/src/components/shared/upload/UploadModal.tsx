import React, {  useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { X, Upload, ArrowUp, CheckCircle2 } from 'lucide-react';
import { useUpload, uploadActions } from '@/context/upload/upload.context';
import UploadProgressStep from './UploadProgressStep';
import SermonDetailsForm from './SermonDetailsForm';
import ListenerSettings from './ListenerSettings';
import ReviewSubmit from './ReviewSubmit';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ open, onOpenChange }) => {
  const { state, dispatch } = useUpload();
  const { currentStep, uploadData, uploadComplete, progress, isLoading } = state;
  const reviewSubmitRef = useRef<(() => void) | null>(null);
  const saveDraftRef = useRef<(() => Promise<void>) | null>(null);
  
  // Check if upload is in progress - defined at component level for use throughout
  const isUploading = uploadData.file && !uploadComplete && isLoading && progress > 0 && progress < 100;

  // Removed auto-switch to details after upload completes
  // Users can manually navigate to any tab they want after upload completes

  // Step configuration
  const steps = [
    { key: 'progress', label: 'Upload Progress', completed: false },
    { key: 'details', label: 'Details', completed: false },
    { key: 'settings', label: 'Listener Settings', completed: false },
    { key: 'review', label: 'Review & Submit', completed: false },
  ];

  // Update step completion status
  const updatedSteps = steps.map(step => ({
    ...step,
    completed: 
      (step.key === 'progress' && uploadData.file && uploadComplete) ||
      (step.key === 'details' && uploadData.title?.trim() && uploadData.description?.trim() && uploadData.category?.trim()) ||
      (step.key === 'settings' && uploadData.isPublic !== undefined) || // Only completed when user has made a choice
      (step.key === 'review' && uploadData.title?.trim() && uploadData.description?.trim() && uploadData.category?.trim() && uploadComplete) 
  }));

  const currentStepIndex = updatedSteps.findIndex(step => step.key === currentStep);

  const handleStepClick = (stepKey: string) => {
    const stepIndex = updatedSteps.findIndex(step => step.key === stepKey);
    
    // Priority 1: Always allow navigation to progress step if file exists (even after upload completes)
    if (stepKey === 'progress' && uploadData.file) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }
    
    // Priority 2: After upload completes, always allow free navigation between ALL tabs
    if (uploadComplete && uploadData.file) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }
    
    // Priority 3: During upload, allow free navigation between all tabs
    if (isUploading) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }
    
    // Priority 4: When not uploading and upload not complete, use normal navigation rules
    // Allow navigation to previous steps or current step
    if (stepIndex <= currentStepIndex) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }
    
    // Priority 5: For forward navigation, check if current step is completed
    if (stepIndex === currentStepIndex + 1 && canProceed()) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }
    
    // If none of the above conditions are met, don't allow navigation
  };

  const handleNext = () => {
    if (!canProceed()) {
      return; // Don't proceed if current step is not valid
    }
    
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < updatedSteps.length) {
      dispatch(uploadActions.setStep(updatedSteps[nextStepIndex].key));
    }
  };

  const handleClose = async () => {
    // Auto-save to draft when closing if there's any data and upload is complete
    // (if upload is still in progress, we'll save the current state as draft)
    if (uploadData.file || uploadData.title || uploadData.description) {
      // Call save draft handler from ReviewSubmit if available, otherwise just close
      if (saveDraftRef.current) {
        try {
          await saveDraftRef.current();
        } catch (error) {
          console.error('Failed to save draft on modal close:', error);
        }
      }
    }
    onOpenChange(false);
    // Reset to file step when closing
    dispatch(uploadActions.setStep('file'));
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'progress':
        return <UploadProgressStep />;
      case 'details':
        return <SermonDetailsForm />;
      case 'settings':
        return <ListenerSettings />;
      case 'review':
        return <ReviewSubmit onModalClose={() => onOpenChange(false)} onSubmitRef={reviewSubmitRef} onSaveDraftRef={saveDraftRef} />;
      default:
        return <UploadProgressStep />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'progress':
        return 'Upload Progress';
      case 'details':
        return 'Sermon Details';
      case 'settings':
        return 'Listener Settings';
      case 'review':
        return 'Review & Submit';
      default:
        return 'Upload Sermon';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'progress':
        return uploadData.file && uploadComplete;
      case 'details':
        return uploadData.title?.trim() && 
               uploadData.description?.trim() && 
               uploadData.category?.trim() &&
               uploadData.title.length >= 3 &&
               uploadData.description.length >= 10;
      case 'settings':
        return true; // Settings are optional
      case 'review':
        return uploadData.file && uploadData.title;
      default:
        return false;
    }
  };

  const isLastStep = currentStepIndex === updatedSteps.length - 1;

  // Calculate estimated time remaining
  const getEstimatedTimeRemaining = () => {
    if (!uploadData.file || uploadComplete || progress === 0) return null;
    
    const fileSizeInMB = uploadData.file.size / (1024 * 1024);
    const baseTimePerMB = 2; // seconds per MB (adjust based on your upload speed)
    const totalEstimatedTime = fileSizeInMB * baseTimePerMB;
    const timeElapsed = (progress / 100) * totalEstimatedTime;
    const timeRemaining = totalEstimatedTime - timeElapsed;
    
    if (timeRemaining < 60) {
      return `${Math.ceil(timeRemaining)}s left`;
    } else {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = Math.ceil(timeRemaining % 60);
      return `${minutes}m ${seconds}s left`;
    }
  };

  // Helper function to get breadcrumb item styling
  const getBreadcrumbItemStyle = (stepKey: string, stepIndex: number) => {
    const step = updatedSteps[stepIndex];
    const isActive = currentStep === stepKey;
    const isCompleted = step.completed;
    
    // Progress step is ALWAYS accessible if file exists (even after upload completes)
    const isProgressStepAccessible = stepKey === 'progress' && uploadData.file;
    
    // After upload completes, ALL tabs are always accessible
    const isAccessibleAfterUpload = uploadComplete && uploadData.file;
    
    // During upload, all tabs are accessible
    const isAccessibleDuringUpload = isUploading;
    
    // Also allow access if step is completed or if it's a previous/current step
    const isAccessibleByNormalRules = stepIndex <= currentStepIndex || isCompleted;
    
    // Combine all accessibility conditions
    const isAccessible = isProgressStepAccessible || isAccessibleAfterUpload || isAccessibleDuringUpload || isAccessibleByNormalRules;
    
    // Allow navigation to all tabs during upload and after completion - no blocking
    let className = 'cursor-pointer transition-all duration-200 flex items-center gap-2 px-4 py-2.5 rounded-md ';
    
    if (isActive) {
      className += 'text-primary  bg-primary/10 border border-primary/20 ';
    } else if (isCompleted) {
      // Completed steps use same styling as accessible steps, no green color
      className += 'text-foreground hover:bg-muted/50';
    } else if (isAccessible) {
      className += 'text-foreground hover:bg-muted/50';
    } else {
      className += 'opacity-50 cursor-not-allowed text-muted-foreground';
    }
    
    return className;
  };

  const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <img 
      src="/images/assets/upload-progress.svg" 
      alt="Upload Progress"
      className={className}
    />
  );
  const DetailsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <img 
      src="/images/assets/details.svg" 
      alt="Details"
      className={className}
    />
  );
  const ReviewIcon: React.FC<{ className?: string }> = ({ className }) => (
    <img 
      src="/images/assets/review.svg" 
      alt="Review"
      className={className}
    />
  );
  const ListenerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <img 
      src="/images/assets/listener.svg" 
      alt="Listener Settings"
      className={className}
    />
  );

  // Custom TooltipContent without arrow
  const TooltipContentNoArrow = ({ className, children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          "bg-[#2b2a2c] text-white border border-border/50 rounded-md z-50",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
  
  const handleSaveDraft = () => {
    // This will be called from the ReviewSubmit component
    // For now, we'll expose this through ReviewSubmit's own handler
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[min(800px,85vw)] h-[min(500px,80vh)] !max-w-none overflow-hidden p-0 flex flex-col" 
        showCloseButton={false}
      >
        {/* Header with breadcrumbs and close button */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="flex items-center mb-3 gap-2">
                <Upload className="h-5 w-5" />
                {getStepTitle()}
              </DialogTitle>
              
              {/* Enhanced Breadcrumb Navigation with Active States */}
              <Breadcrumb>
                <BreadcrumbList className="gap-0 items-center">
                  <BreadcrumbItem>
                    <div className="relative flex flex-col">
                      <BreadcrumbLink 
                        onClick={() => handleStepClick('progress')}
                        className={getBreadcrumbItemStyle('progress', 0)}
                      >
                        <UploadIcon className="h-4 w-4" />
                        Upload Progress
                      </BreadcrumbLink>
                      {currentStep === 'progress' && (
                        <div className="h-0.5 bg-primary rounded-full mt-1" />
                      )}
                    </div>
                  </BreadcrumbItem>
                  <div className="h-4 w-[2px] bg-border/50 " />
                  <BreadcrumbItem>
                    <div className="relative flex flex-col">
                      <BreadcrumbLink 
                        onClick={() => handleStepClick('details')}
                        className={getBreadcrumbItemStyle('details', 1)}
                      >
                        <DetailsIcon className="h-4 w-4" />
                        Details
                      </BreadcrumbLink>
                      {currentStep === 'details' && (
                        <div className="h-0.5 bg-primary rounded-full mt-1" />
                      )}
                    </div>
                  </BreadcrumbItem>
                  <div className="h-4 w-px bg-border/50 " />
                  <BreadcrumbItem>
                    <div className="relative flex flex-col">
                      <BreadcrumbLink 
                        onClick={() => handleStepClick('settings')}
                        className={getBreadcrumbItemStyle('settings', 2)}
                      >
                        <ListenerIcon className="h-4 w-4" />
                        Listener Settings
                      </BreadcrumbLink>
                      {currentStep === 'settings' && (
                        <div className="h-0.5 bg-primary rounded-full mt-1" />
                      )}
                    </div>
                  </BreadcrumbItem>
                  <div className="h-4 w-px bg-border/50 " />
                  <BreadcrumbItem>
                    <div className="relative flex flex-col">
                      {currentStep === 'review' ? (
                        <>
                          <BreadcrumbPage className={getBreadcrumbItemStyle('review', 3)}>
                            <ReviewIcon className="h-4 w-4" />
                            Review & Submit
                          </BreadcrumbPage>
                          <div className="h-0.5 bg-primary rounded-full mt-1" />
                        </>
                      ) : (
                        <BreadcrumbLink 
                          onClick={() => handleStepClick('review')}
                          className={getBreadcrumbItemStyle('review', 3)}
                        >
                          <ReviewIcon className="h-4 w-4" />
                          Review & Submit
                        </BreadcrumbLink>
                      )}
                    </div>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 min-h-0">
          <div className="w-full max-w-none">
            {getStepContent()}
          </div>
        </div>

        {/* Enhanced Footer with upload progress and buttons */}
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            {/* Left: Upload Progress Info (show during upload regardless of current step) */}
            {uploadData.file && !uploadComplete && isLoading && progress > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 text-sm cursor-pointer">
                    <div className="flex items-center gap-2 text-blue-600">
                      <ArrowUp className="h-4 w-4 animate-pulse" />
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="text-muted-foreground">
                      Uploading {uploadData.file.name}
                    </div>
                    {getEstimatedTimeRemaining() && (
                      <div className="text-muted-foreground">
                        • {getEstimatedTimeRemaining()}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContentNoArrow 
                  side="top" 
                  className="p-4 min-w-[250px]"
                >
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Video uploading</div>
                    <div className="text-sm">{Math.round(progress)}% uploaded</div>
                    <Progress value={progress} className="h-2" />
                    {getEstimatedTimeRemaining() && (
                      <div className="text-xs text-muted-foreground">{getEstimatedTimeRemaining()}</div>
                    )}
                  </div>
                </TooltipContentNoArrow>
              </Tooltip>
            )}
            
            {/* Show upload complete status */}
            {uploadData.file && uploadComplete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm cursor-pointer">
                    <div className="flex items-center gap-2 text-green-600">
                      <ArrowUp className="h-4 w-4" />
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-foreground">Upload completed</span>
                  </div>
                </TooltipTrigger>
                <TooltipContentNoArrow 
                  side="top" 
                  className="p-4"
                >
                  <div className="text-sm font-medium">Video upload completed</div>
                </TooltipContentNoArrow>
              </Tooltip>
            )}
            
            {/* Spacer when no progress info */}
            {!(uploadData.file && ((!uploadComplete && isLoading && progress > 0) || uploadComplete)) && (
              <div></div>
            )}
            
            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="min-w-[100px]"
              >
                Close
              </Button>
              
              {/* Show Save Draft button on Review step */}
              {currentStep === 'review' && (
                <Button
                  onClick={async () => {
                    if (saveDraftRef.current) {
                      await saveDraftRef.current();
                    }
                  }}
                  disabled={isLoading || isUploading || !uploadData.title}
                  variant="outline"
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </Button>
              )}
              
              {/* Show Publish button on Review step, Continue button on other steps */}
              {currentStep === 'review' ? (
                <Button
                  onClick={() => {
                    if (reviewSubmitRef.current) {
                      reviewSubmitRef.current();
                    }
                  }}
                  disabled={isLoading || isUploading || !uploadData.file || !uploadData.title}
                  className="min-w-[120px] bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    'Publish'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`min-w-[120px] transition-all ${
                    isLastStep 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : ''
                  }`}
                >
                  {isLastStep ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Publish Sermon
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
