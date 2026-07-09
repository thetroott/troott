export type S3MultipartPurpose =
    | 'sermon-audio'
    | 'storage-image'
    | 'storage-document';

export type S3MultipartSessionStatus =
    | 'pending'
    | 'uploading'
    | 'completed'
    | 'aborted';

export interface IS3MultipartSessionDoc {
    sessionId: string;
    uploadId: string;
    s3UploadId: string;
    s3Key: string;
    bucket: string;
    ownerId: string;
    purpose: S3MultipartPurpose;
    contentType: string;
    contentLength: number;
    filename?: string;
    fileType: string;
    finalized: boolean;
    status: S3MultipartSessionStatus;
    sermonId?: string;
    storageComplete?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
