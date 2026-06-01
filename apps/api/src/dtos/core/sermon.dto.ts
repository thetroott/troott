import { SeriesPreviewDTO } from '@/dtos/core/series.dto';
import type {
    ImageSource,
    SermonSource,
    MediaStatus,
    StreamingProtocol,
    StreamingQuality,
} from '@/interfaces/core/sermon.interface';
import { PassThrough } from 'stream';
import { ObjectId } from 'mongoose';
import { FileType, IResult } from '@/interfaces/common.interface';

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
    id?: string;

    title?: string;
    description?: string;
    duration?: number;
    preachedAt?: string | Date;
    preachedYear?: string;
    language?: string;

    topic?: string;
    tags?: Array<string>;
    isPublic?: boolean;
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
    title: string;
    description: string;
    duration: number;
    /** Audio upload id (resolves the draft sermon document). */
    sermon: string;
    image: Partial<ImageSource> | string;
    size: number;
    preachedAt: Date | string;
    preachedYear: string;
    topic: string;
    tags: Array<string> | string;
    language?: string;
    isPublic: boolean;
    isSeries: boolean;
    publishedBy: string;

    id?: string;
    status?: MediaStatus;
    isPublished?: boolean;
    publishedAt?: Date;
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

/** @see {@link IAudioHLSJobDTO} in `@/interfaces/core/sermon.interface` */
export type { IAudioHLSJobDTO } from '@/interfaces/core/sermon.interface';

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
    /** Spool from stream into outputDir/_ingest when inputFilePath omitted (internal ffmpeg). */
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
    stream: PassThrough;
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

/** @deprecated Use {@link SermonDTO} for API sermon responses. */
export type SermonResponseDTO = SermonDTO;

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
