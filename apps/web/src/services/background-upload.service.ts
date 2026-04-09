export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'cancelled' | 'error';
  error?: string;
  startTime: number;
  estimatedTime: number;
  intervalId?: number;
}

type UploadProgressCallback = (uploadId: string, progress: number) => void;
type UploadCompleteCallback = (uploadId: string, task: UploadTask) => void;
type UploadCancelledCallback = (uploadId: string, task: UploadTask) => void;

type UploadEventListeners = {
  progress: UploadProgressCallback[];
  complete: UploadCompleteCallback[];
  cancelled: UploadCancelledCallback[];
};

class BackgroundUploadService {
  private activeUploads = new Map<string, UploadTask>();
  private listeners: UploadEventListeners = {
    progress: [],
    complete: [],
    cancelled: [],
  };

  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  startUpload(file: File): string {
    if (!file) {
      throw new Error('No file provided for upload');
    }
    const uploadId = this.generateUploadId();
    const fileSizeInMB = file.size / (1024 * 1024);
    const estimatedTimeInSeconds = Math.max(10, Math.min(60, fileSizeInMB * 2));
    const totalSteps = 100;
    const intervalTime = (estimatedTimeInSeconds * 1000) / totalSteps;

    const task: UploadTask = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading',
      startTime: Date.now(),
      estimatedTime: estimatedTimeInSeconds * 1000,
      intervalId: undefined,
    };

    this.activeUploads.set(uploadId, task);

    task.intervalId = window.setInterval(() => {
      const currentTask = this.activeUploads.get(uploadId);
      if (!currentTask || currentTask.status !== 'uploading') {
        return;
      }

      const nextProgress = Math.min(100, currentTask.progress + 1);
      currentTask.progress = nextProgress;

      if (nextProgress >= 100) {
        currentTask.status = 'completed';
        if (currentTask.intervalId !== undefined) {
          window.clearInterval(currentTask.intervalId);
          currentTask.intervalId = undefined;
        }
        this.activeUploads.delete(uploadId);
        this.emitComplete(uploadId, currentTask);
      } else {
        this.emitProgress(uploadId, nextProgress);
      }
    }, intervalTime);

    return uploadId;
  }

  cancelUpload(uploadId: string): boolean {
    const task = this.activeUploads.get(uploadId);
    if (!task) {
      return false;
    }

    if (task.intervalId !== undefined) {
      window.clearInterval(task.intervalId);
      task.intervalId = undefined;
    }

    task.status = 'cancelled';
    this.activeUploads.delete(uploadId);
    this.emitCancelled(uploadId, task);
    return true;
  }

  getUploadStatus(uploadId: string): UploadTask | null {
    const activeTask = this.activeUploads.get(uploadId);
    if (activeTask) {
      return activeTask;
    }
    return null;
  }

  onProgress(callback: UploadProgressCallback): void {
    this.listeners.progress.push(callback);
  }

  offProgress(callback: UploadProgressCallback): void {
    this.listeners.progress = this.listeners.progress.filter(fn => fn !== callback);
  }

  onComplete(callback: UploadCompleteCallback): void {
    this.listeners.complete.push(callback);
  }

  offComplete(callback: UploadCompleteCallback): void {
    this.listeners.complete = this.listeners.complete.filter(fn => fn !== callback);
  }

  onCancelled(callback: UploadCancelledCallback): void {
    this.listeners.cancelled.push(callback);
  }

  offCancelled(callback: UploadCancelledCallback): void {
    this.listeners.cancelled = this.listeners.cancelled.filter(fn => fn !== callback);
  }

  private emitProgress(uploadId: string, progress: number): void {
    for (const callback of this.listeners.progress) {
      callback(uploadId, progress);
    }
  }

  private emitComplete(uploadId: string, task: UploadTask): void {
    for (const callback of this.listeners.complete) {
      callback(uploadId, task);
    }
  }

  private emitCancelled(uploadId: string, task: UploadTask): void {
    for (const callback of this.listeners.cancelled) {
      callback(uploadId, task);
    }
  }
}

export const backgroundUploadService = new BackgroundUploadService();
