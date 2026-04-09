import React, { useRef } from 'react';
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
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  X,
  Upload,
  ArrowUp,
  CheckCircle2,
  FileText,
  Settings2,
  ClipboardCheck,
} from 'lucide-react';
import { useUpload, uploadActions } from '@/context/upload/upload.context';
import UploadProgressStep from './UploadProgressStep';
import SermonDetailsForm from './SermonDetailsForm';
import ListenerSettings from './ListenerSettings';
import ReviewSubmit from './ReviewSubmit';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TooltipContentNoArrow = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={cn(
        'bg-[#2b2a2c] text-white border border-border/50 rounded-md z-50',
        className
      )}
      {...props}
    >
      {children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
);

const UploadModal: React.FC<UploadModalProps> = ({ open, onOpenChange }) => {
  const { state, dispatch } = useUpload();
  const { currentStep, uploadData, uploadComplete, progress, isLoading } =
    state;
  const reviewSubmitRef = useRef<(() => void) | null>(null);

  const isUploading =
    !!uploadData.file &&
    !uploadComplete &&
    isLoading &&
    progress > 0 &&
    progress < 100;

  const steps = [
    { key: 'progress', label: 'Upload Progress', completed: false },
    { key: 'details', label: 'Details', completed: false },
    { key: 'settings', label: 'Listener Settings', completed: false },
    { key: 'review', label: 'Review & Submit', completed: false },
  ];

  const updatedSteps = steps.map((step) => ({
    ...step,
    completed:
      (step.key === 'progress' && !!uploadData.file && uploadComplete) ||
      (step.key === 'details' &&
        !!uploadData.title?.trim() &&
        !!uploadData.description?.trim() &&
        !!uploadData.category?.trim()) ||
      (step.key === 'settings' && uploadData.isPublic !== undefined) ||
      (step.key === 'review' &&
        !!uploadData.title?.trim() &&
        !!uploadData.description?.trim() &&
        !!uploadData.category?.trim() &&
        uploadComplete),
  }));

  const currentStepIndex = updatedSteps.findIndex(
    (step) => step.key === currentStep
  );

  const handleStepClick = (stepKey: string) => {
    const stepIndex = updatedSteps.findIndex((step) => step.key === stepKey);

    if (stepKey === 'progress' && uploadData.file) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }

    if (uploadComplete && uploadData.file) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }

    if (isUploading) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }

    if (stepIndex <= currentStepIndex) {
      dispatch(uploadActions.setStep(stepKey));
      return;
    }

    if (stepIndex === currentStepIndex + 1 && canProceed()) {
      dispatch(uploadActions.setStep(stepKey));
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < updatedSteps.length) {
      dispatch(uploadActions.setStep(updatedSteps[nextStepIndex].key));
    }
  };

  const handleClose = () => {
    if (
      !uploadComplete &&
      (uploadData.file || uploadData.title || uploadData.description)
    ) {
      dispatch(uploadActions.clearStoredData());
    }

    onOpenChange(false);
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
        return (
          <ReviewSubmit
            onModalClose={() => onOpenChange(false)}
            onSubmitRef={reviewSubmitRef}
          />
        );
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
        return !!uploadData.file && uploadComplete;
      case 'details':
        return (
          !!uploadData.title?.trim() &&
          !!uploadData.description?.trim() &&
          !!uploadData.category?.trim() &&
          uploadData.title.length >= 3 &&
          uploadData.description.length >= 10
        );
      case 'settings':
        return true;
      case 'review':
        return !!uploadData.file && !!uploadData.title;
      default:
        return false;
    }
  };

  const isLastStep = currentStepIndex === updatedSteps.length - 1;

  const getEstimatedTimeRemaining = () => {
    if (!uploadData.file || uploadComplete || progress === 0) return null;

    const fileSizeInMB = uploadData.file.size / (1024 * 1024);
    const baseTimePerMB = 2;
    const totalEstimatedTime = fileSizeInMB * baseTimePerMB;
    const timeElapsed = (progress / 100) * totalEstimatedTime;
    const timeRemaining = totalEstimatedTime - timeElapsed;

    if (timeRemaining < 60) {
      return `${Math.ceil(timeRemaining)}s left`;
    }
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.ceil(timeRemaining % 60);
    return `${minutes}m ${seconds}s left`;
  };

  const getBreadcrumbItemStyle = (stepKey: string, stepIndex: number) => {
    const step = updatedSteps[stepIndex];
    const isActive = currentStep === stepKey;
    const isCompleted = step.completed;

    const isProgressStepAccessible = stepKey === 'progress' && !!uploadData.file;
    const isAccessibleAfterUpload = uploadComplete && !!uploadData.file;
    const isAccessibleDuringUpload = isUploading;
    const isAccessibleByNormalRules =
      stepIndex <= currentStepIndex || isCompleted;

    const isAccessible =
      isProgressStepAccessible ||
      isAccessibleAfterUpload ||
      isAccessibleDuringUpload ||
      isAccessibleByNormalRules;

    let className =
      'cursor-pointer transition-all duration-200 flex items-center gap-2 px-4 py-2.5 rounded-md ';

    if (isActive) {
      className +=
        'text-primary  bg-primary/10 border border-primary/20 ';
    } else if (isCompleted) {
      className += 'text-foreground hover:bg-muted/50';
    } else if (isAccessible) {
      className += 'text-foreground hover:bg-muted/50';
    } else {
      className += 'opacity-50 cursor-not-allowed text-muted-foreground';
    }

    return className;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(800px,85vw)] h-[min(500px,80vh)] !max-w-none overflow-hidden p-0 flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="flex items-center mb-3 gap-2">
                <Upload className="h-5 w-5" />
                {getStepTitle()}
              </DialogTitle>

              <Breadcrumb>
                <BreadcrumbList className="gap-0 items-center">
                  <BreadcrumbItem>
                    <div className="relative flex flex-col">
                      <BreadcrumbLink
                        onClick={() => handleStepClick('progress')}
                        className={getBreadcrumbItemStyle('progress', 0)}
                      >
                        <Upload className="h-4 w-4" />
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
                        <FileText className="h-4 w-4" />
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
                        <Settings2 className="h-4 w-4" />
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
                          <BreadcrumbPage
                            className={getBreadcrumbItemStyle('review', 3)}
                          >
                            <ClipboardCheck className="h-4 w-4" />
                            Review & Submit
                          </BreadcrumbPage>
                          <div className="h-0.5 bg-primary rounded-full mt-1" />
                        </>
                      ) : (
                        <BreadcrumbLink
                          onClick={() => handleStepClick('review')}
                          className={getBreadcrumbItemStyle('review', 3)}
                        >
                          <ClipboardCheck className="h-4 w-4" />
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

        <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 min-h-0">
          <div className="w-full max-w-none">{getStepContent()}</div>
        </div>

        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
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
                        &bull; {getEstimatedTimeRemaining()}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContentNoArrow side="top" className="p-4 min-w-[250px]">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Audio uploading</div>
                    <div className="text-sm">{Math.round(progress)}% uploaded</div>
                    <Progress value={progress} className="h-2" />
                    {getEstimatedTimeRemaining() && (
                      <div className="text-xs text-muted-foreground">
                        {getEstimatedTimeRemaining()}
                      </div>
                    )}
                  </div>
                </TooltipContentNoArrow>
              </Tooltip>
            )}

            {uploadData.file && uploadComplete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm cursor-pointer">
                    <div className="flex items-center gap-2 text-green-600">
                      <ArrowUp className="h-4 w-4" />
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-foreground">
                      Upload completed
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContentNoArrow side="top" className="p-4">
                  <div className="text-sm font-medium">
                    Audio upload completed
                  </div>
                </TooltipContentNoArrow>
              </Tooltip>
            )}

            {!(
              uploadData.file &&
              ((!uploadComplete && isLoading && progress > 0) || uploadComplete)
            ) && <div />}

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="min-w-[100px]"
              >
                Close
              </Button>

              {currentStep === 'review' ? (
                <Button
                  onClick={() => reviewSubmitRef.current?.()}
                  disabled={
                    isLoading ||
                    isUploading ||
                    !uploadData.file ||
                    !uploadData.title
                  }
                  className="min-w-[120px] bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
