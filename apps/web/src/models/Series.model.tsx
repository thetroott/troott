import type { ImageSource } from '@/dtos/sermon-media.types';

export interface SeriesMinisterRef {
    id: string;
    name: string;
    avatar?: string;
}

export interface Series {
    id: string;
    code: string;
    slug: string;
    title: string;
    description: string;
    banner?: Partial<ImageSource>;
    ministers: SeriesMinisterRef[];
    totalDuration: number;
    numberOfSermons: number;
    topic?: string;
    tags: string[];
    language: string;
    status: string;
    isPublic: boolean;
    shareableUrl: string;
    playCount: number;
    downloadCount: number;
    commentCount: number;
    shareCount: number;
    likeCount: number;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    _version?: number;
    _id?: string;
}

export default Series;
