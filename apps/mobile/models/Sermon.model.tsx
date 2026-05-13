import Minister from './Minister.model';
import Playlist from './Playlist.model';
import Series from './Series.model';
import Topic from './Topic.model';
import User from './User.model';

/**
 * Client-side sermon shape aligned with `apps/api/src/interfaces/core/sermon.interface.ts`.
 * IDs are strings as returned in JSON.
 */
interface Sermon {
    code: string;
    slug: string;
    title: string;
    description: string;

    playbackUrl: string;
    manifestUrl: string;
    imageUrl: string;
    mimeType: string;
    duration: number;
    bitrate: number;
    protocol: SermonStreamingProtocol;
    quality: SermonStreamingQuality;

    topic: Topic | any;
    tags: Array<string>;
    language: string;
    isPublic: boolean;

    token: string;
    tokenType: SermonTokenType;
    signature: string;
    isAuthorized: boolean;
    authorizationReason?: string;

    series: Series | any;
    isSeries: boolean;
    minister: Array<Minister> | any;
    playlist: Playlist | any;

    preachedAt: string;
    preachedYear: string;
    shareableUrl: string;
    searchText: string;

    allowDownload: boolean;
    allowComment: boolean;

    item: SermonSource;
    image: ImageSource;

    status: MediaStatus;
    isPublished: boolean;
    publishedAt: Date;
    publishedBy: User | any;

    playCount: number;
    downloadCount: number;
    commentCount: number;
    shareCount: number;
    likeCount: number;
    featured: boolean;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export enum MediaSource {
    DOWNLOAD = 'download',
    STREAM = 'stream',
}

export enum SermonTokenType {
    JWT = 'jwt',
    SIGNED_URL = 'signed_url',
    CDN_TOKEN = 'cdn_token',
}

export interface SermonSource {
    item: string;
    duration: number;
    size: number;
    fileType: string;
    mimetype: AudioFileMimeType;

    itemId: string;
    uploadedBy: User | any;
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
    mimetype: ImageFileMimeType;

    itemId: string;
    uploadedBy: User | any;
    uploadStatus: UploadStatus;

    createdAt: string;
    updatedAt: string;
}

/** Adaptive streaming protocol (aligned with API `StreamingProtocol`). */
export enum SermonStreamingProtocol {
    HLS = 'hls',
    DASH = 'dash',
    PROGRESSIVE = 'progressive',
    SMOOTHSTREAMING = 'smoothstreaming',
}

/** Quality tier on the sermon document (aligned with API `StreamingQuality`). */
export enum SermonStreamingQuality {
    AUTO = 'auto',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    LOSSLESS = 'lossless',
}

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

    HLS = 'application/x-mpegURL',
    DASH = 'application/dash+xml',
}

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

export default Sermon;
