/**
 * Sermon media / streaming enums and upload metadata — aligned with
 * `apps/api/src/interfaces/core/sermon.interface.ts`.
 */

export enum MediaSource {
    DOWNLOAD = 'download',
    STREAM = 'stream',
}

export enum TokenType {
    JWT = 'jwt',
    SIGNED_URL = 'signed_url',
    CDN_TOKEN = 'cdn_token',
}

export enum StreamingProtocol {
    HLS = 'hls',
    DASH = 'dash',
    PROGRESSIVE = 'progressive',
    SMOOTHSTREAMING = 'smoothstreaming',
}

export enum StreamingQuality {
    AUTO = 'auto',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    LOSSLESS = 'lossless',
}

export enum AudioType {
    HLS = 'hls',
    DASH = 'dash',
    PROGRESSIVE = 'progressive',
    SMOOTHSTREAMING = 'smoothstreaming',
}

export enum UploadStatus {
    IDLE = 'idle',
    UPLOADING = 'uploading',
    UPLOADED = 'uploaded',
    PROCESSING = 'processing',
    EXTRACTING = 'extracting',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export enum MediaStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
    FLAGGED = 'flagged',
    DELETED = 'deleted',
}

/** Minimal uploader ref for web (API uses full user doc). */
export interface SermonSource {
    item: string;
    duration: number;
    size: number;
    fileType: string;
    mimetype: string;
    itemId: string;
    uploadedBy?: string;
    uploadStatus: UploadStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ImageSource {
    item: string;
    width: number;
    height: number;
    size: number;
    fileType: string;
    mimetype: string;
    itemId: string;
    uploadedBy?: string;
    uploadStatus: UploadStatus;
    createdAt: string;
    updatedAt: string;
}
