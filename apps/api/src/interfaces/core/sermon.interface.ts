import { Document, Types } from 'mongoose';
import { FileType } from '../common.interface';
import IMinisterDoc from './minister.interface';
import IPlaylistDoc from './playlist.interface';
import ISeriesDoc from './series.interface';
import ITopicDoc from './topic.interface';
import IUserDoc from '../user.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a sermon (the core media unit on the platform).
 *
 * A sermon is an audio recording that has been uploaded, processed
 * (transcoded to HLS/DASH), and optionally published. It belongs to
 * one or more {@link IMinisterDoc ministers}, may be part of a
 * {@link ISeriesDoc series}, and can appear in many
 * {@link IPlaylistDoc playlists}.
 *
 * Contains delivery fields (playbackUrl, manifestUrl, protocol) used
 * by the streaming layer, upload provenance (item, image sources),
 * and engagement counters.
 */
interface ISermonDoc extends Document {
    /** Short unique code. */
    code: string;
    /** URL-safe slug. */
    slug: string;
    /** Sermon title. */
    title: string;
    /** Short description or summary. */
    description: string;

    /** Signed CDN HLS/DASH playback URL. */
    playbackUrl: string;
    /** Master playlist URL (.m3u8 or .mpd). */
    manifestUrl: string;
    /** CDN URL of the sermon's cover image. */
    imageUrl: string;

    /** MIME type of the stream (e.g. `application/x-mpegURL`). */
    mimeType: string;
    /** Duration of the sermon in seconds. */
    duration: number;
    /** Bitrate in kbps. */
    bitrate: number;
    /** Streaming protocol used for delivery. */
    protocol: StreamingProtocol;
    /** Quality tier. */
    quality: StreamingQuality;

    /** Topic or category the sermon belongs to. */
    topic: ITopicDoc | any;
    /** Free-form tags for search and discovery. */
    tags: Array<string>;
    /** ISO-639 language code (e.g. `en`, `yo`). */
    language: string;
    /** Whether the sermon is publicly accessible. */
    isPublic: boolean;

    /** Signed access token for CDN / DRM validation. */
    token: string;
    /** How the token should be interpreted. */
    tokenType: TokenType;
    /** Cryptographic signature for token integrity. */
    signature: string;
    /** Whether the requesting user is authorised to play this sermon. */
    isAuthorized: boolean;
    /** Reason the user was denied access, if applicable. */
    authorizationReason?: string;

    /** Parent series (album), if the sermon is part of one. */
    series: ISeriesDoc | any;
    /** Whether this sermon belongs to a series. */
    isSeries: boolean;
    /** Minister(s) who delivered the sermon (can be multiple). */
    minister: Array<IMinisterDoc> | any;
    /** Playlist this sermon was added from (context-dependent). */
    playlist: IPlaylistDoc | any;

    /** ISO-8601 date when the sermon was originally preached. */
    preachedAt: string;
    /** Four-digit year the sermon was preached. */
    preachedYear: string;
    /** Public shareable URL. */
    shareableUrl: string;
    /** Concatenated text blob for full-text search indexing. */
    searchText: string;

    /** Whether the sermon may be downloaded for offline use. */
    allowDownload: boolean;
    /** Whether comments are enabled on the sermon. */
    allowComment: boolean;

    /** Original audio file upload metadata. */
    item: SermonSource;
    /** Cover image upload metadata. */
    image: ImageSource;

    /** Publishing lifecycle status. */
    status: MediaStatus;
    /** Whether the sermon is currently published. */
    isPublished: boolean;
    /** When the sermon was published. */
    publishedAt: Date;
    /** Admin or minister who published the sermon. */
    publishedBy: IUserDoc | any;

    /** Total play count. */
    playCount: number;
    /** Total download count. */
    downloadCount: number;
    /** Total comment count. */
    commentCount: number;
    /** Total share count. */
    shareCount: number;
    /** Total like count. */
    likeCount: number;
    /** Whether the sermon is featured by the platform. */
    featured: boolean;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/** How the listener obtained the media file. */
export enum MediaSource {
    DOWNLOAD = 'download',
    STREAM = 'stream',
}

/** Authentication token type used for stream access control. */
export enum TokenType {
    /** JSON Web Token. */
    JWT = 'jwt',
    /** Pre-signed CDN URL. */
    SIGNED_URL = 'signed_url',
    /** CDN-specific edge token. */
    CDN_TOKEN = 'cdn_token',
}

/**
 * Provenance record for the original audio file.
 *
 * Tracks the raw upload through transcoding and links back to the
 * uploader and S3 object.
 */
export interface SermonSource {
    /** S3 / CDN URL of the original media file. */
    item: string;
    /** Duration in seconds. */
    duration: number;
    /** File size in bytes. */
    size: number;
    /** File extension or type label. */
    fileType: string;
    /** Audio MIME type. */
    mimetype: AudioFileMimeType;

    /** S3 object key of the original file. */
    itemId: string;
    /** User who uploaded the file. */
    uploadedBy: IUserDoc | any;
    /** Current processing status. */
    uploadStatus: UploadStatus;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
}

/**
 * Provenance record for the sermon cover image.
 *
 * Includes dimensional metadata for responsive rendering.
 */
export interface ImageSource {
    /** S3 / CDN URL of the original image file. */
    item: string;
    /** Image width in pixels. */
    width: number;
    /** Image height in pixels. */
    height: number;

    /** File size in bytes. */
    size: number;
    /** File extension or type label. */
    fileType: string;
    /** Image MIME type. */
    mimetype: ImageFileMimeType;

    /** S3 object key of the original file. */
    itemId: string;
    /** User who uploaded the image. */
    uploadedBy: IUserDoc | any;
    /** Current processing status. */
    uploadStatus: UploadStatus;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
}

/** Adaptive streaming protocol used to deliver a sermon. */
export enum StreamingProtocol {
    /** HTTP Live Streaming (Apple). */
    HLS = 'hls',
    /** Dynamic Adaptive Streaming over HTTP (MPEG). */
    DASH = 'dash',
    /** Single-file progressive download. */
    PROGRESSIVE = 'progressive',
    /** Microsoft Smooth Streaming. */
    SMOOTHSTREAMING = 'smoothstreaming',
}

/** Quality tier for streaming or download. */
export enum StreamingQuality {
    /** Adaptive bitrate (player decides). */
    AUTO = 'auto',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    /** Lossless / CD quality. */
    LOSSLESS = 'lossless',
}

/** Audio MIME types the platform accepts or produces. */
export enum AudioFileMimeType {
    MPEG = 'audio/mpeg',
    MP3 = 'audio/mp3',
    AAC = 'audio/aac',

    WAV = 'audio/wav',
    FLAC = 'audio/flac',
    ALAC = 'audio/mp4',

    OPUS = 'audio/ogg; codecs=opus',
    OGG = 'audio/ogg',
    WEBM = 'audio/webm',

    M4A = 'audio/x-m4a',
    MP4_AUDIO = 'audio/mp4',
    CAF = 'audio/x-caf',

    /** HLS master playlist (.m3u8). */
    HLS = 'application/x-mpegURL',
    /** DASH manifest (.mpd). */
    DASH = 'application/dash+xml',
}

/** Image MIME types the platform accepts. */
export enum ImageFileMimeType {
    JPEG = 'image/jpeg',
    PNG = 'image/png',
    WEBP = 'image/webp',
    SVG = 'image/svg+xml',
    AVIF = 'image/avif',
    GIF = 'image/gif',
    BMP = 'image/bmp',
    TIFF = 'image/tiff',
    ICO = 'image/x-icon',
}

/**
 * Processing pipeline status for an uploaded file.
 *
 * Progresses linearly: IDLE -> UPLOADING -> UPLOADED -> PROCESSING ->
 * EXTRACTING -> COMPLETED. Can branch to FAILED or CANCELLED at any stage.
 */
export enum UploadStatus {
    /** Initial state -- nothing started. */
    IDLE = 'idle',
    /** File is transferring from device to server. */
    UPLOADING = 'uploading',
    /** Raw file fully received by server / S3. */
    UPLOADED = 'uploaded',
    /** Server is transcoding (e.g. MP3 to HLS segments). */
    PROCESSING = 'processing',
    /** Extracting metadata (duration, tags, waveform). */
    EXTRACTING = 'extracting',
    /** Ready for public consumption. */
    COMPLETED = 'completed',
    /** Processing failed (network or server error). */
    FAILED = 'failed',
    /** User cancelled the upload. */
    CANCELLED = 'cancelled',
}

/**
 * Publishing lifecycle status of a sermon.
 *
 * Controls visibility across the platform.
 */
export enum MediaStatus {
    /** Info saved, files may not be ready. */
    DRAFT = 'draft',
    /** Files uploaded, awaiting admin approval. */
    PENDING = 'pending',
    /** Active and visible to everyone. */
    PUBLISHED = 'published',
    /** Hidden from public but retained in DB. */
    ARCHIVED = 'archived',
    /** Hidden due to copyright / content policy violation. */
    FLAGGED = 'flagged',
    /** Soft-deleted. */
    DELETED = 'deleted',
}

// ---------------------------------------------------------------------------
// Audio / media metadata
// ---------------------------------------------------------------------------

export interface IAudioMetadata {
    metadataType: FileType;
    formatName?: string;
    codec?: string;
    duration?: number;
    bitrate?: number;
    year?: number;
}

export interface IImageMetadata {
    metadataType: FileType;
    width?: number;
    height?: number;
    format?: string;
}

export interface IVideoMetadata {
    metadataType: FileType;
    duration?: number;
    resolution?: string;
    codec?: string;
    framerate?: number;
}

export interface IDocumentMetadata {
    metadataType: FileType;
    pageCount?: number;
    author?: string;
    title?: string;
    language?: string;
}

// ---------------------------------------------------------------------------
// Audio processing DTOs
// ---------------------------------------------------------------------------

export interface AudioRenditionDTO {
    name: string;
    bitrate: number;
    sampleRate: number;
    channels: number;
}

export interface FFmpegRenditionDTO {
    name?: string;
    codec?: string;
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
    extraArgs?: string[];
}

export interface FFmpegOptionsDTO {
    args: string[];
    inputStream?: import('stream').PassThrough;
    inputFilePath?: string;
    outputStream?: import('stream').PassThrough;
    onData?: string[];
}

export interface FFmpegJobDTO {
    input: string;
    output: string;
    options: FFmpegOptionsDTO;
}

export interface IAudioHLSJobDTO {
    uploadId: string;
    sourceS3Key: string;
    mimeType?: string;
    renditions?: AudioRenditionDTO[];
    segmentDuration?: number;
}

export interface IAudioDASHJobDTO {
    uploadId: string;
    mimeType?: string;
    inputStream: import('stream').PassThrough;
    outputStream: import('stream').PassThrough;
    renditions: AudioRenditionDTO[];
    segmentDuration?: number;
}

export interface IAudioMetadataJobDTO {
    streamForMetadata: import('stream').PassThrough;
    mimeType: string;
    uploadId: string;
    sermonId?: Types.ObjectId | any;
}

export interface IAudioProcessingJobDTO {
    stream: import('stream').PassThrough;
    mimeType: string;
    uploadId: string;
}

export interface IAudioNormalisationDTO {
    uploadId: string;
    inputStream: import('stream').PassThrough;
    outputStream: import('stream').PassThrough;
    mimeType: string;
    targetIntegrated?: number;
    targetTruePeak?: number;
}

export interface HLSDTO {
    inputFilePath?: string;
    inputStream?: import('stream').Readable;
    outputDir: string;
    renditions: AudioRenditionDTO[];
    segmentDuration?: number;
}

export interface DASHDTO {
    inputStream: import('stream').PassThrough;
    outputDir: string;
    renditions: AudioRenditionDTO[];
    segmentDuration?: number;
}

export interface MeasureLoudnessDTO {
    stream: import('stream').PassThrough;
}

export interface NormaliseAudioDTO {
    inputStream: import('stream').PassThrough;
    outputStream: import('stream').PassThrough;
    targetIntegrated?: number;
    targetTruePeak?: number;
}

export interface MultiBitrateDTO {
    inputStream: import('stream').PassThrough;
    renditions: AudioRenditionDTO[];
    outputDir: string;
}

export interface LoudnessMetadataDTO {
    trackId: string;
    integrated: number;
    loudnessRange: number;
    truePeak: number;
    path: string;
}

export interface AudioProcessingResult {
    success?: import('../common.interface').IResult;
    loudness?: LoudnessMetadataDTO;
    outputs?: { name: string; path: string }[];
}

// ---------------------------------------------------------------------------
// Audio type enum
// ---------------------------------------------------------------------------

export enum AudioType {
    HLS = 'hls',
    DASH = 'dash',
    PROGRESSIVE = 'progressive',
    SMOOTHSTREAMING = 'smoothstreaming',
}

// ---------------------------------------------------------------------------
// Engagement sub-documents
// ---------------------------------------------------------------------------

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

export type { ISermonDoc };
export default ISermonDoc;
