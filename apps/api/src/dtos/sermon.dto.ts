import { ContentState, ContentStatus } from '../utils/enums.util';
import { SeriesPreviewDTO } from '@/dtos/series.dto';
import type { ImageSource, SermonSource } from '@/modules/core/sermon/sermon.interface';
import { IMinisterDoc, ISeriesDoc } from '@/utils/interfaces.util';

/**
 * @name SermonUploadDTO
 * @description A DTO for uploading a sermon.
 * This DTO is used to upload a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {SermonUploadDTO}
 */
export interface SermonUploadDTO {
    id: string;
    title: string;
    description: string;

    size: number;
    duration: number;
    releaseDate: Date;
    releaseYear: number;
    topic: string;
    tags: Array<string>;
    isPublic: boolean;
    isSeries?: boolean;
    series?: Array<string>;
    minister: string | string;
    playlist?: string | string;
    publishedBy: string | string;
}

/**
 * @name SermonDTO
 * @description A DTO for a sermon.
 * This DTO is used to return a sermon to the client.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {SermonDTO}
 */
export interface SermonDTO {
    id: string;
    title: string;
    description: string;
    duration: number;
    image: Partial<ImageSource>;
    minister: Partial<IMinisterDoc>;

    topic: string; // sermon topic or category
    tags: Array<string>;
    isPublic: boolean;
    shareableUrl: string;

    releaseDate: string;
    releaseYear: number;

    seriesId?: string;
    series?: SeriesPreviewDTO;
}

/**
 * @name SermonPlaybackDTO
 * @description A DTO for playing a sermon.
 * This DTO is used to play a sermon.
 * It contains the playback information about the sermon.
 * @access Public
 * @returns {SermonPlaybackDTO}
 */
export interface SermonPlaybackDTO {
    id: string;
    sermon: Partial<SermonSource>;
}

/**
 * @name UpdateSermonDTO
 * @description A DTO for updating a sermon.
 * This DTO is used to update a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {UpdateSermonDTO}
 */
export interface UpdateSermonDTO {
    id?: string;

    title?: string;
    description?: string;
    duration?: number;
    shareableUrl?: string;
    sermonUrl?: string;
    imageUrl?: string;
    size?: number;
    releaseDate?: string | Date;
    releaseYear?: string | number;

    topic?: string;
    tags?: Array<string>;
    isPublic?: boolean;
    allowDownload?: boolean;
    allowComment?: boolean;

    isSeries?: boolean;
    seriesId?: Partial<ISeriesDoc>;
    series?: Partial<ISeriesDoc> | unknown;

    sermon?: Partial<SermonSource>;
    image?: Partial<ImageSource>;
    minister?: Partial<IMinisterDoc>;
    playlist?: unknown;

    status?: ContentStatus;
    state?: ContentState;
    isPublished?: boolean;
    publishedBy?: string;
    publishedAt?: Date;
    versionId?: unknown;
    changesSummary?: string;
    uploadRef?: string;
    uploadSummary?: unknown;
}

/**
 * @name PublishSermonDTO
 * @description A DTO for publishing a sermon.
 * This DTO is used to publish a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {PublishSermonDTO}
 */
/**
 * Payload for {@link SermonService.handlePublishSermon} / {@link SermonService.validateSermonPublish}.
 * `sermon` is the audio **upload id** used to resolve the draft sermon document.
 */
export interface PublishSermonDTO {
    title: string;
    description: string;
    duration: number;
    /** Audio upload id (matches `uploadSummary.uploadId`) */
    sermon: string;
    image: Partial<ImageSource> | string | unknown;
    size: number;
    releaseDate: Date | string;
    releaseYear: number;
    topic: string;
    tags: Array<string> | string;
    isPublic: boolean;
    isSeries: boolean;
    publishedBy: string | string;

    id?: string;
    status?: ContentStatus;
    state?: ContentState;
    isPublished?: boolean;
    publishedAt?: Date;
}

/**
 * @name DeleteSermonDTO
 * @description A DTO for deleting a sermon.
 * This DTO is used to delete a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {DeleteSermonDTO}
 */
export interface DeleteSermonDTO {
    id: string;
    state?: ContentState;
    status?: ContentStatus;
    publishedBy?: string;
}

/**
 * @name moveSermonToBinDTO
 * @description A DTO for moving a sermon to the bin.
 * This DTO is used to move a sermon to the bin.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {moveSermonToBinDTO}
 */
export interface MoveSermonToBinDTO {
    id: string;
    state?: ContentState;
    status?: ContentStatus;
    publishedBy?: string;
}

/**
 * @name UploadDTO
 * @description A DTO for uploading a sermon.
 * This DTO is used to upload a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {UploadDTO}
 */
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
