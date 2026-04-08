import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileAudio, CheckCircle2, Trash2 } from 'lucide-react';
import { useUpload, uploadActions } from '@/context/upload/upload.context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import axios from 'axios';
import apiCall from '@/api/config';
import { toast } from 'sonner';

const UploadProgressStep: React.FC = () => {
  const { state, dispatch } = useUpload();
  const { uploadData, progress, uploadComplete } = state;
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const file = uploadData.file;
    if (!file || uploadComplete) return;

    const ac = new AbortController();
    let cancelled = false;
    setUploadError(false);

    dispatch(uploadActions.setLoading(true));
    dispatch(uploadActions.setProgress(0));

    const formData = new FormData();
    formData.append('file', file);

    (async () => {
      try {
        const res = await apiCall.sermon.startUpload(
          formData,
          (pct) => {
            if (!cancelled) dispatch(uploadActions.setProgress(pct));
          },
          ac.signal
        );

        if (cancelled) return;

        const payload = res.data?.data as
          | { id?: string; uploadRef?: string }
          | undefined;

        if (!payload?.id) {
          throw new Error('Upload response did not include a sermon id.');
        }

        dispatch(
          uploadActions.setUploadData({
            sermonId: payload.id,
            uploadRef: payload.uploadRef,
          })
        );
        dispatch(uploadActions.setUploadComplete(true));
        dispatch(uploadActions.setProgress(100));
      } catch (e: unknown) {
        if (cancelled || axios.isCancel(e)) return;
        const message =
          e &&
          typeof e === 'object' &&
          'message' in e &&
          typeof (e as { message: unknown }).message === 'string'
            ? (e as { message: string }).message
            : 'Upload failed. Please try again.';
        toast.error(message);
        setUploadError(true);
        dispatch(uploadActions.setProgress(0));
        dispatch(uploadActions.setUploadComplete(false));
      } finally {
        if (!cancelled) {
          dispatch(uploadActions.setLoading(false));
        }
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [uploadData.file, uploadComplete, retryToken, dispatch]);

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
    dispatch(uploadActions.resetUpload());
    setShowRemoveDialog(false);
  };

  const handleCancelRemove = () => {
    setShowRemoveDialog(false);
  };

  const handleRetry = () => {
    setUploadError(false);
    setRetryToken((t) => t + 1);
  };

  if (!uploadData.file) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No file selected. Please select an audio file to upload.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="border border-border/50 rounded-lg p-6 bg-gradient-to-br from-background to-muted/10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FileAudio className="h-10 w-10 text-blue-500" />
              {uploadComplete && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {uploadData.file.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(uploadData.file.size)} &bull; Audio File
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              {uploadError
                ? 'Upload failed'
                : uploadComplete
                  ? 'Upload Complete'
                  : 'Uploading...'}
            </h4>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          {uploadComplete && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                File uploaded successfully
              </span>
            </div>
          )}

          {uploadError && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-destructive">
                Something went wrong while uploading. You can retry.
              </p>
              <Button size="sm" variant="outline" onClick={handleRetry}>
                Retry upload
              </Button>
            </div>
          )}
        </div>

        {uploadComplete && (
          <div className="pt-4 border-t">
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={() => dispatch(uploadActions.setStep('details'))}
                className="px-8 py-2 bg-primary hover:bg-primary/90"
              >
                Continue to Details
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveAudio}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Audio
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <span>Remove audio?</span>
            </DialogTitle>
            <DialogDescription>
              This will clear the current upload and draft form data.
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
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadProgressStep;
