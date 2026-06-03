import { SeriesPreviewDTO } from '@/dtos/core/series.dto';
import type {
    ImageSource,
    SermonSource,
    MediaStatus,
    SermonVisibilityStatus,
    StreamingProtocol,
    StreamingQuality,
} from '@/interfaces/core/sermon.interface';
import { PassThrough, Readable } from 'stream';
import { Types } from 'mongoose';
import { FileType, IResult } from '@/interfaces/common.interface';

type ObjectId = Types.ObjectId;

export interface SermonUploadDTO {
    id: string;
    title: string;
    description: string;

    size: number;
    duration: number;
    preachedAt: Date | string;
    preachedYear: string;
    topic: string;
    tags: Array<string>;
    language?: string;
    isPublic: boolean;
    visibility?: SermonVisibilityStatus;
    allowDownload?: boolean;
    allowComment?: boolean;
    isSeries?: boolean;
    series?: string;
    minister: string;
    playlist?: string;
    publishedBy: string;
}

export interface SermonDTO {
    id: string;
    /** Audio pipeline ref (`item.itemId`); present on upload responses. */
    uploadRef?: string;
    code: string;
    slug: string;
    title: string;
    description: string;
    duration: number;
    imageUrl: string;
    image: Partial<ImageSource>;
    item?: Partial<SermonSource>;
    minister: Array<{ id: string; name: string; avatar?: string }>;

    playbackUrl: string;
    manifestUrl: string;
    mimeType: string;
    protocol: StreamingProtocol;
    quality: StreamingQuality;

    topic: string;
    tags: Array<string>;
    language: string;
    isPublic: boolean;
    visibility: SermonVisibilityStatus;
    shareableUrl: string;

    preachedAt: string;
    preachedYear: string;
    allowDownload: boolean;
    allowComment: boolean;

    status: MediaStatus;
    isPublished: boolean;

    playCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
    downloadCount: number;
    featured: boolean;

    seriesId?: string;
    series?: SeriesPreviewDTO;

    createdAt: string;
}

export interface SermonPlaybackDTO {
    id: string;
    sermon: Partial<SermonSource>;
}

export interface UpdateSermonDTO {
    title?: string;
    description?: string;
    duration?: number;
    preachedAt?: string | Date;
    preachedYear?: string;
    language?: string;

    topic?: string;
    tags?: Array<string>;
    isPublic?: boolean;
    visibility?: SermonVisibilityStatus;
    allowDownload?: boolean;
    allowComment?: boolean;

    isSeries?: boolean;
    series?: string;
    minister?: string[];
    playlist?: string;

    sermon?: Partial<SermonSource>;
    image?: Partial<ImageSource>;

    status?: MediaStatus;
    isPublished?: boolean;
    publishedBy?: string;
    publishedAt?: Date;
}

/**
 * Payload for sermon publish flow.
 * `sermon` is the audio upload id used to resolve the draft sermon document.
 */
export interface PublishSermonDTO {
    code: string;
    slug: string;
    title: string;
    description: string;

    playbackUrl: string;
    manifestUrl: string;
    imageUrl: string;
    duration: number;

    mimeType: string;
    bitrate: number;
    protocol: StreamingProtocol;
    quality: StreamingQuality;

    topic: string;
    tags: Array<string>;
    language: string;
    isPublic: boolean;
    visibility: SermonVisibilityStatus;

    preachedAt: string;
    preachedYear: string;
    minister: Array<string>;

    allowDownload: boolean;
    allowComment: boolean;

    sermon: string;
    item: SermonSource;
    image: ImageSource;

    isSeries: boolean;
    series: string;
    playlist: string;

    status: MediaStatus;
    isPublished: boolean;
    publishedBy: string;
    publishedAt: string;
}

export interface PublishSermonInputDTO {
    title: string;
    description: string;
    topic: string;
    tags: Array<string>;
    language: string;

    visibility: SermonVisibilityStatus;
    isPublic: boolean;
    preachedAt: string;
    preachedYear: string;
    minister: string | Array<string>;
    publishedBy: string;

    allowDownload: boolean;
    allowComment: boolean;

    isSeries: boolean;
    series: string;
    playlist: string;

    status: MediaStatus;
    isPublished: boolean;
    publishedAt: string | Date;
}

export interface SermonPipelineDTO {
    item: SermonSource;
    image: ImageSource;
    imageUrl: string;
    playbackUrl: string;
    manifestUrl: string;
    duration: number;
    mimeType: string;
    protocol: StreamingProtocol;
    quality: StreamingQuality;
    bitrate: number;
}

export interface DeleteSermonDTO {
    id: string;
    status?: MediaStatus;
    publishedBy?: string;
}

export interface MoveSermonToBinDTO {
    id: string;
    status?: MediaStatus;
    publishedBy?: string;
}

export interface UploadDTO {
    id: string;
    file: string;
    uploadedBy: string;
    uploadRef: string;
}

export interface IAudioMetadata {
    metadataType: FileType.AUDIO;
    formatName?: string;
    codec?: string;
    duration?: number;
    bitrate?: number;
    year?: number;
}

export interface AudioQualityDTO {
    name: string;
    bitrate: number;
    sampleRate: number;
    channels: number;
}

export interface AudioPlaybackDTO {
    inputStream: Readable;
    normalizationFilter: string;
    audioQualities: Array<AudioQualityDTO>;
    hlsOutputPath: string;
    hlsSegmentDuration: number;
}

export interface AudioNormalizationDTO {
    measuredIntegratedLoudness: number;
    measuredTruePeak: number;
    measuredLoudnessRange: number;
    measuredThreshold: number;
    targetOffset: number;
    audioNormalizationParameters: string;
}


/** Internal FFmpeg runner options (`audio.service.ts`). */
export interface FFmpegOptionsDTO {
    args: Array<string>;
    inputStream?: PassThrough;
    outputStream?: PassThrough;
    onData?: Array<string>;
}

export interface IAudioHLSJobDTO {
    uploadId: string;
    sourceS3Key: string;
    mimeType: string;
    audioQualities: AudioQualityDTO[];
    segmentDuration: number;
    sermonId: ObjectId | string;
}

export interface IAudioMetadataJobDTO {
    sourceS3Key: string;
    mimeType: string;
    uploadId: string;
    sermonId: ObjectId | string;
}


export enum AudioType {
    HLS = 'hls',
    DASH = 'dash',
    PROGRESSIVE = 'progressive',
    SMOOTHSTREAMING = 'smoothstreaming',
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
