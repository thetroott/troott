/**
 * Series DTOs aligned with `apps/api/src/dtos/core/series.dto.ts`.
 */
import type { ImageSource } from '@/models/Sermon.model';

export interface CreateSeriesDTO {
    title: string;
    description: string;
    banner?: Partial<ImageSource> | string;
    ministers: string[];
    sermons?: string[];
    topic?: string;
    tags?: Array<string>;
    language?: string;
    isPublic?: boolean;
}

export interface SeriesDTO {
    id: string;
    code: string;
    slug: string;
    title: string;
    description: string;
    banner?: Partial<ImageSource>;

    ministers: Array<{ id: string; name: string; avatar?: string }>;
    totalDuration: number;
    numberOfSermons: number;

    topic?: string;
    tags: Array<string>;
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
}

export interface SeriesPreviewDTO {
    id: string;
    title: string;
    banner?: Partial<ImageSource>;
    position: number;
}

export interface UpdateSeriesDTO {
    title?: string;
    description?: string;
    banner?: Partial<ImageSource> | string;
    ministers?: string[];
    sermons?: string[];
    topic?: string;
    tags?: Array<string>;
    language?: string;
    isPublic?: boolean;
    status?: string;
}

export interface DeleteSeriesDTO {
    id: string;
    publishedBy?: string;
}

export interface MoveSeriesToBinDTO {
    id: string;
    publishedBy?: string;
}
