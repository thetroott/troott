import Minister from './Minister.model';
import Playlist from './Playlist.model';
import Series from './Series.model';
import Topic from './Topic.model';
import User from './User.model';

interface Sermon {
    code: string;
    slug: string;
    title: string;
    description: string;

    // Playback
    playbackUrl: string; // the cdn url of the sermon for playback
    imageUrl: string; // the cdn url of the image for the sermon
    mimeType: string; // the mime type of the sermon - application/x-mpegURL
    mediaSource: MediaSource;
    duration: number;
    mediaType: AudioType;

    // Classification
    topic: Topic | any; // the topic or category of the sermon
    tags: Array<string>; // the tags of the sermon  can be used as additional search keywords
    language: string; // the language of the sermon - en, es, etc.
    isPublic: boolean;

    // Relationships
    series: Series | any; // the series (album) of the sermon
    isSeries: boolean;
    minister: Array<Minister> | any; // the ministers of the sermon can be multiple ministers
    playlist: Playlist | any;

    // Search and Discovery
    preachedAt: string; // When the sermon was originally preached
    preachedYear: string; // The year the sermon was originally preached
    shareableUrl: string;
    searchText: string; // the search text of the sermon can be used as additional search keywords

    // Playback Rules
    allowDownload: boolean;
    allowComment: boolean;

    // Upload
    item: SermonSource;
    image: ImageSource;

    // Publishing
    status: MediaStatus; // the status of the media item (sermon)
    isPublished: boolean;
    publishedAt: Date;
    publishedBy: User | any;

    // Engagement
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
    id: string; // the id of the media item (sermon)
}

export enum MediaSource {
    DOWNLOAD = 'download',
    STREAM = 'stream',
}

export interface SermonSource {
    item: string; // original media item URL
    duration: number; // in seconds
    size: number; // in bytes
    fileType: string;
    mimetype: AudioFileMimeType;

    itemId: string; // the id of the original media item (sermon)
    uploadedBy: User | any;
    uploadStatus: UploadStatus;

    createdAt: string;
    updatedAt: string;
}

export interface ImageSource {
    item: string; // original image item URL (sermon)
    width: number;
    height: number;

    size: number; // in bytes
    fileType: string;
    mimetype: ImageFileMimeType;

    itemId: string; // the id of the original image item (sermon)
    uploadedBy: User | any;
    uploadStatus: UploadStatus;

    createdAt: string;
    updatedAt: string;
}

export enum AudioType {
    HLS = 'hls',
    DASH = 'dash',
    PROGRESSIVE = 'progressive',
    SMOOTHSTREAMING = 'smoothstreaming',
}

export enum AudioFileMimeType {
    // Standard Compressed
    MPEG = 'audio/mpeg', // Official for MP3
    MP3 = 'audio/mp3', // Common but non-standard (keep for compatibility)
    AAC = 'audio/aac', // Standard for mobile/web streaming

    // High-Quality / Lossless
    WAV = 'audio/wav', // Uncompressed
    FLAC = 'audio/flac', // The industry gold standard for lossless
    ALAC = 'audio/mp4', // Apple Lossless often uses the mp4/m4a container

    // Modern / Efficient
    OPUS = 'audio/ogg; codecs=opus', // Best for low-latency/voice (e.g. WhatsApp/Sermons)
    OGG = 'audio/ogg', // Common open-source format
    WEBM = 'audio/webm', // High efficiency, often used with Opus

    // Apple / Mobile Specific
    M4A = 'audio/x-m4a', // Your current M4A
    MP4_AUDIO = 'audio/mp4', // The official MIME for .m4a files
    CAF = 'audio/x-caf', // Apple Core Audio Format (used for system sounds/Opus)

    // Streaming Protocols (CRITICAL for HLS/Dash)
    HLS = 'application/x-mpegURL', // The most important missing one for HLS [.m3u8]
    DASH = 'application/dash+xml', // Manifest for MPEG-DASH streaming [.mpd]
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
    IDLE = 'idle', // Initial state, nothing started
    UPLOADING = 'uploading', // File is currently moving from device to server
    UPLOADED = 'uploaded', // Raw file is fully received by the server/S3

    PROCESSING = 'processing', // Server is transcoding (e.g., converting MP3 to HLS, converting image to playlist thumbnails, etc.)
    EXTRACTING = 'extracting', // Optional: Getting metadata like duration/tags

    COMPLETED = 'completed', // Ready for the public to listen
    FAILED = 'failed', // Something went wrong (network or server error)
    CANCELLED = 'cancelled', // User stopped the upload manually
}

export enum MediaStatus {
    DRAFT = 'draft', // Info is saved, but files might not be there yet
    PENDING = 'pending', // Files are uploaded but waiting for admin approval
    PUBLISHED = 'published', // Active and visible to everyone
    ARCHIVED = 'archived', // Hidden from public but kept in DB
    FLAGGED = 'flagged', // Hidden due to copyright/content issues
    DELETED = 'deleted', // Soft delete
}

export default Sermon;
