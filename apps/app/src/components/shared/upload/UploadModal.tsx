import React from 'react';
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
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
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
  const { currentStep, uploadData, uploadComplete } = state;

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
      (step.key === 'settings' && uploadData.isPublic !== undefined) ||
      (step.key === 'review' && false) // Will be completed when published
  }));

  const currentStepIndex = updatedSteps.findIndex(step => step.key === currentStep);

  const handleStepClick = (stepKey: string) => {
    const stepIndex = updatedSteps.findIndex(step => step.key === stepKey);
    
    // Allow navigation to previous steps or current step
    if (stepIndex <= currentStepIndex) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }
    
    // For forward navigation, check if current step is completed
    if (stepIndex === currentStepIndex + 1 && canProceed()) {
      dispatch(uploadActions.setStep(stepKey));
    }
    
    // Don't allow skipping steps - must complete current step first
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

  const handleClose = () => {
    // Clear stored data when closing modal without completing upload
    if (!uploadComplete && (uploadData.file || uploadData.title || uploadData.description)) {
      dispatch(uploadActions.clearStoredData());
    }
    
    onOpenChange(false);
    // Reset to file step when closing
    dispatch(uploadActions.setStep('file'));
  };

  const handlePrevious = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      dispatch(uploadActions.setStep(updatedSteps[prevStepIndex].key));
    } else {
      // Clear stored data when going back to file upload without completing
      if (!uploadComplete && (uploadData.file || uploadData.title || uploadData.description)) {
        dispatch(uploadActions.clearStoredData());
      }
      
      // Go back to file upload
      dispatch(uploadActions.setStep('file'));
      onOpenChange(false);
    }
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
        return <ReviewSubmit />;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[min(800px,85vw)] h-[min(450px,75vh)] !max-w-none aspect-[16/9] overflow-hidden p-0 flex flex-col" 
        showCloseButton={false}
      >
        {/* Header with breadcrumbs and close button */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {getStepTitle()}
              </DialogTitle>
              
              {/* Breadcrumb Navigation */}
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => handleStepClick('progress')}
                      className={`cursor-pointer ${currentStep === 'progress' ? 'text-primary font-medium' : ''}`}
                    >
                      Upload Progress
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => handleStepClick('details')}
                      className={`cursor-pointer ${currentStep === 'details' ? 'text-primary font-medium' : ''} ${!updatedSteps[0].completed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Details
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => handleStepClick('settings')}
                      className={`cursor-pointer ${currentStep === 'settings' ? 'text-primary font-medium' : ''} ${!updatedSteps[1].completed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Listener Settings
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {currentStep === 'review' ? (
                      <BreadcrumbPage>Review & Submit</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        onClick={() => handleStepClick('review')}
                        className={`cursor-pointer ${!updatedSteps[2].completed ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Review & Submit
                      </BreadcrumbLink>
                    )}
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
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          <div className="w-full max-w-none">
            {getStepContent()}
          </div>
        </div>

        {/* Footer with navigation buttons */}
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              {currentStepIndex === 0 ? 'Back to Upload' : 'Previous'}
            </Button>
            
            <div className="flex items-center gap-2">
              {/* Step indicators */}
              {updatedSteps.map((step, index) => (
                <div
                  key={step.key}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index <= currentStepIndex 
                      ? 'bg-primary' 
                      : 'bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {isLastStep ? 'Publish Sermon' : 'Continue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;