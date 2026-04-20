import type { Readable } from 'stream';
import { Document, Types } from 'mongoose';
import { ContentState, ContentStatus } from '../../../utils/content.enums';
import { FileType } from '../../shared/files/file.enums';
import { UploadStatus, UploadStepType } from '../../platform/storage/upload.enums';

type ObjectId = Types.ObjectId;

export interface IAudioMetadata {
    metadataType: FileType.AUDIO;
    formatName?: string;
    codec?: string;
    duration?: number;
    bitrate?: number;
    year?: number;
}

/** Bull job payload for `audio:metadata` extraction workers. */
export interface IAudioMetadataJobDTO {
    streamForMetadata: Readable;
    mimeType: string;
    uploadId: string;
}

export interface IImageMetadata {
    metadataType: FileType.IMAGE;
    width?: number;
    height?: number;
    format?: string;
}

export interface IDocumentMetadata {
    metadataType: FileType.DOCUMENT;
    pageCount?: number;
    author?: string;
    title?: string;
    language?: string;
}

export interface IVideoMetadata {
    metadataType: FileType.VIDEO;
    duration?: number;
    resolution?: string;
    codec?: string;
    framerate?: number;
}

export interface ISermonPlayCount {
    userId: ObjectId;
    playedAt: Date;
}

export interface ISermonShareCount {
    userId: ObjectId;
    sharedAt: Date;
}

export interface ISermonLike {
    userId: ObjectId;
    likedAt: Date;
}

export interface IBiteViewHistory {
    userId: ObjectId;
    watchedAt: Date;
}

export interface IBiteLike {
    userId: ObjectId;
    likedAt: Date;
}

export interface IBiteShareHistory {
    userId: ObjectId;
    ShareCount: number;
}

export interface IBiteSavedHistory {
    userId: ObjectId;
    saved: boolean;
    savedAt: Date;
}

export interface IBiteEngagementStats {
    totalLikes: number;
    totalShares: number;
    totalViews: number;
    totalSaves: number;
    avgWatchTime: number;
    completionRate: number;
}

export interface ISermonDoc extends Document {
    title: string;
    description: string;
    duration: number;
    releaseDate: Date;
    releaseYear: number;
    sermonUrl: string;
    imageUrl: string;
    size: number;

    topic: string;
    /** Optional stable segment for share URLs (`/sermon/:slug`). */
    slug?: string;
    tags: Array<string>;
    isPublic: boolean;
    shareableUrl: string;

    isSeries: boolean;
    series: Array<ObjectId>;

    totalPlay: ISermonPlayCount;
    totalLikes: ISermonLike;
    totalShares: ISermonShareCount;
    state: ContentState;
    status: ContentStatus;
    uploadState: UploadStepType;

    uploadSummary: {
        fileId: string;
        fileName: string;
        fileSize: number;
        fileType: FileType;
        mimetype: string;
        metadata: Partial<IAudioMetadata>;
        uploadedBy: ObjectId;
        uploadStatus: UploadStatus;
        uploadId: string;
        s3Key: string;
        rawFile: string;
    };

    imageSummary: {
        fileName: string;
        fileSize: number;
        fileType: FileType;
        mimetype: string;
        uploadedBy: ObjectId;
        uploadStatus: UploadStatus;
        uploadId: string;
        s3Key: string;
        rawFile: string;
    };

    versionId?: ObjectId;
    changesSummary: string;

    minister: ObjectId | any;
    playlist: ObjectId | any;
    publishedBy: ObjectId | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export interface ISermonBiteDoc extends Document {
    title: string;
    description: string;
    duration: number;
    category: Array<string>;
    biteURL: string;
    thumbnailUrl?: string;
    tags: Array<string>;

    engagementStats: IBiteEngagementStats;
    viewHistory: Array<IBiteViewHistory>;
    likeHistory: Array<IBiteLike>;
    shareHistory: Array<IBiteShareHistory>;
    savedHistory: Array<IBiteSavedHistory>;

    isPublic: boolean;
    state: ContentState;
    status: ContentStatus;

    versionId?: ObjectId;
    modifiedAt: string;
    modifiedBy: ObjectId | any;
    changesSummary: string;
    deletedBites: Array<{
        id: ObjectId;
        deletedBy: ObjectId | any;
        deletedAt: string;
        reason?: string;
    }>;

    minister: ObjectId | any;
    creator: ObjectId | any;
    Admin: ObjectId | any;
    playlist: Array<ObjectId>;
    library: Array<ObjectId>;
    createdBy: ObjectId | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
