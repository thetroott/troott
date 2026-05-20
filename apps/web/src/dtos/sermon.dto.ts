import type { SeriesPreviewDTO } from './series.dto';
import type { ImageSource, SermonSource } from './sermon-media.types';
import {
    MediaStatus,
    StreamingProtocol,
    StreamingQuality,
} from './sermon-media.types';

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
    code: string;
    slug: string;
    title: string;
    description: string;
    duration: number;
    imageUrl: string;
    image: Partial<ImageSource>;
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

export interface PublishSermonDTO {
    title: string;
    description: string;
    duration: number;
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
