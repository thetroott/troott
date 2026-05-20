import type { ImageSource } from '@/dtos/sermon-media.types';
import {
    MediaStatus,
    StreamingProtocol,
    StreamingQuality,
} from '@/dtos/sermon-media.types';

export interface SermonMinisterRef {
    id: string;
    name: string;
    avatar?: string;
}

export interface SermonSeriesPreview {
    id: string;
    title: string;
    banner?: Partial<ImageSource>;
    position: number;
}

export interface Sermon {
    id: string;
    code: string;
    slug: string;
    title: string;
    description: string;
    duration: number;
    imageUrl: string;
    image: Partial<ImageSource>;
    minister: SermonMinisterRef[];
    playbackUrl: string;
    manifestUrl: string;
    mimeType: string;
    protocol: StreamingProtocol;
    quality: StreamingQuality;
    topic: string;
    tags: string[];
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
    series?: SermonSeriesPreview;
    createdAt: string;
    _version?: number;
    _id?: string;
}

export default Sermon;
