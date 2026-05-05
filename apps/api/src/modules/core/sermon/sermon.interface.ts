import type { PassThrough, Readable } from 'stream';
import { Document, Types } from 'mongoose';
import { ContentState, ContentStatus } from '../../../utils/content.enums';
import { FileMimeType, FileType } from '../../shared/file.enums';
import {
    ProcessingState,
    UploadStatus,
    UploadStepType,
} from '../../platform/storage/upload.enums';
import { ISeriesDoc } from '../series/series.interface';
import { IResult } from '@/utils/interfaces.util';

type ObjectId = Types.ObjectId;

export interface ISermonDoc extends Document {
    title: string;
    description: string;
    duration?: number;
    releaseDate: Date;
    releaseYear: number;

    sermon?: SermonSource;
    image?: ImageSource;
    sermonUrl?: string;
    imageUrl?: string;
    size?: number;
    slug?: string;
    shareableUrl?: string;

    topic: string; // sermon topic or category
    tags: Array<string>;
    isPublic: boolean;
    allowDownload: boolean;
    allowComment: boolean;

    isSeries: boolean;
    series: ISeriesDoc | any;

    totalPlay: ISermonPlayCount;
    totalLikes: ISermonLike;
    totalShares: ISermonShareCount;

    state: ContentState;
    status: ContentStatus;
    uploadState: UploadStepType;

    /** Multivariant HLS manifest URL (CDN or HTTPS). Set after packaging completes. */
    hlsMasterUrl?: string;
    /** Derivative packaging lifecycle for adaptive playback. */
    processingStatus?: ProcessingState;
    processingError?: string;
    failedStage?: string;
    derivativesReadyAt?: Date;

    uploadSummary?: Record<string, unknown>;
    imageSummary?: Record<string, unknown>;

    versionId?: ObjectId;
    changesSummary: string;

    minister: ObjectId | any;
    playlist: ObjectId | any;

    isPublished: boolean;
    publishedAt: Date;
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

export interface SermonSource {
    cdnUrl: string; // cdn URL
    type: AudioType;

    originalUrl: string; // original URL
    duration: number; // in seconds
    size: number; // in bytes
    shareableUrl: string;
    fileType: FileType;
    mimetype: FileMimeType;

    uploadedBy: ObjectId;
    uploadStatus: UploadStatus;
    uploadId: string;

    createdAt: string;
    updatedAt: string;
}

export interface ImageSource {
    thumbnailUrl: string;
    width: number;
    height: number;

    originalUrl: string;
    size: number; // in bytes
    fileType: FileType;
    mimetype: FileMimeType;

    uploadedBy: ObjectId;
    uploadStatus: UploadStatus;
    uploadId: string;

    createdAt: string;
    updatedAt: string;
}

export interface Upload {
    fileName: string;
    s3Key: string;
}

export interface IAudioNormalisationDTO {
    uploadId: string;
    inputStream: PassThrough;
    outputStream: PassThrough;
    mimeType: string;
    targetIntegrated?: number; // LUFS, default -14
    targetTruePeak?: number; // dBTP, default -1
}

export interface AudioRenditionDTO {
    name: string;
    bitrate: number;
    sampleRate: number;
    channels: number;
}
export interface FFmpegRenditionDTO {
    name?: string; // e.g., "64k", "128k"
    codec?: string; // e.g., 'aac'
    bitrate?: number; // e.g., 128 (kbps)
    sampleRate?: number; // e.g., 48000 Hz
    channels?: number; // 1 for mono, 2 for stereo
    extraArgs?: string[]; // any extra CLI args
}

export interface IAudioHLSJobDTO {
    uploadId: string;
    /** Original object key in S3 (stream-first: worker reads via GetObject). */
    sourceS3Key: string;
    mimeType?: string;
    renditions?: AudioRenditionDTO[];
    segmentDuration?: number;
}

export interface IAudioDASHJobDTO {
    uploadId: string;
    mimeType?: string;
    inputStream: PassThrough;
    outputStream: PassThrough
    renditions: AudioRenditionDTO[];
    segmentDuration?: number;
}

export interface HLSDTO {
    /** Prefer after upload completes — mutually preferred vs inputStream. */
    inputFilePath?: string;
    /** Legacy path: spool from stream into outputDir/_ingest when inputFilePath omitted. */
    inputStream?: import('stream').Readable;
    /** Temp output root; HLS segment files and playlists are written per rendition under this path. */
    outputDir: string;
    renditions: AudioRenditionDTO[];
    segmentDuration?: number;
}

export interface DASHDTO {
    inputStream: PassThrough;
    outputDir: string;
    renditions: AudioRenditionDTO[];
    segmentDuration?: number;
}

export interface MeasureLoudnessDTO {
    stream: PassThrough;
}

/** Pipe loudness-normalized PCM/WAV to `outputStream` (FFmpeg `pipe:1` -> consumer). */
export interface NormaliseAudioDTO {
    inputStream: PassThrough;
    outputStream: PassThrough;
    targetIntegrated?: number;
    targetTruePeak?: number;
}

export interface MultiBitrateDTO {
    inputStream: PassThrough;
    renditions: AudioRenditionDTO[];
    outputDir: string;
}

export interface LoudnessMetadataDTO {
    trackId: string;
    integrated: number;
    loudnessRange: number; // LRA
    truePeak: number; // TP dB
    path: string;
}

export interface AudioProcessingResult {
    success?: IResult;
    loudness?: LoudnessMetadataDTO;
    outputs?: { name: string; path: string }[];
}

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
    streamForMetadata: PassThrough;
    mimeType: string;
    uploadId: string;
    sermonId?: ObjectId | any;
}

export interface IAudioProcessingJobDTO {
    stream: Readable;
    mimeType: string;
    uploadId: string;
}

export interface FFmpegOptionsDTO {
    args: string[];
    /** Pipe this stream into ffmpeg stdin (mutually exclusive with `inputFilePath` for a typical transcode). */
    inputStream?: PassThrough;
    /** Read from a file path instead of stdin (e.g. after one-shot spool of the upload to disk for multi-rendition HLS). */
    inputFilePath?: string;
    outputStream?: PassThrough;
    onData?: string[];
}

export interface FFmpegJobDTO {
    input: string;
    output: string;
    options: FFmpegOptionsDTO;
}

export enum AudioType {
    HLS = 'hls',
    DASH = 'dash',
    PROGRESSIVE = 'progressive',
    SMOOTHSTREAMING = 'smoothstreaming',
}

export enum G {}

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
