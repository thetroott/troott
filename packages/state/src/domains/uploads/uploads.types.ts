export type UploadInFlight = {
    sermonId?: string;
    fileName: string;
    bytesTotal: number;
    bytesUploaded: number;
    uploadState: string;
    processingStatus: string | null;
    failedStage: string | null;
    retries: number;
    derivativesReadyAt?: string | null;
    error?: string | null;
};

export interface UploadsState {
    inFlight: Record<string, UploadInFlight>;
    completedIds: string[];
    failedIds: string[];
    deletedTrackIds: string[];
    deletedSeriesIds: string[];
}

export type UploadsAction =
    | {
          type: 'REGISTER_UPLOAD';
          payload: { id: string; record: UploadInFlight };
      }
    | {
          type: 'PATCH_UPLOAD';
          payload: { id: string; patch: Partial<UploadInFlight> };
      }
    | {
          type: 'COMPLETE_UPLOAD';
          payload: { id: string };
      }
    | {
          type: 'FAIL_UPLOAD';
          payload: { id: string };
      };
