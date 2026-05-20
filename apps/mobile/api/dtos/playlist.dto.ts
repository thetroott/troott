/**
 * Playlist DTOs — aligned with `apps/api/src/dtos/core/playlist.dto.ts`
 * and `interfaces/core/playlist.interface.ts`.
 */
import {
    PlaylistOwnerType,
    PlaylistStatus,
    PlaylistType,
    PlaylistVisibility,
} from '@/models/Playlist.model';

export type {
    PlaylistOwnerType,
    PlaylistStatus,
    PlaylistType,
    PlaylistVisibility,
} from '@/models/Playlist.model';

export interface CreatePlaylistDTO {
    title: string;
    description?: string;
    banner?: string;
    playlistType: PlaylistType;
    visibility: PlaylistVisibility;
    ownerType: PlaylistOwnerType;
    isCollaborative?: boolean;
    tags?: Array<string>;
    genres?: Array<string>;
    languages?: Array<string>;
}

export interface UpdatePlaylistDTO {
    title?: string;
    description?: string;
    banner?: string;
    playlistType?: PlaylistType;
    visibility?: PlaylistVisibility;
    ownerType?: PlaylistOwnerType;
    isCollaborative?: boolean;
    tags?: Array<string>;
    genres?: Array<string>;
    languages?: Array<string>;
}

export interface AddPlaylistItemDTO {
    itemId: string;
    position?: number;
}

export interface RemovePlaylistItemDTO {
    itemId: string;
}

export interface ReorderPlaylistItemDTO {
    itemId: string;
    newPosition: number;
}

export interface PlaylistItemDTO {
    id: string;
    item: {
        id: string;
        title: string;
        imageUrl?: string;
        duration?: number;
        minister?: string;
    };
    position: number;
    addedAt: string;
}

export interface PlaylistResponseDTO {
    id: string;
    code: string;
    slug: string;
    title: string;
    description: string;
    banner: string;
    items: Array<PlaylistItemDTO>;
    itemsCount: number;
    totalDurationMs: number;
    status: PlaylistStatus;
    visibility: PlaylistVisibility;
    playlistType: PlaylistType;
    ownerType: PlaylistOwnerType;
    owner?: { id: string; name: string };
    listener?: { id: string; name: string };
    minister?: { id: string; name: string };
    isCollaborative: boolean;
    likesCount: number;
    savesCount: number;
    followersCount: number;
    sharesCount: number;
    playsCount: number;
    isPublic: boolean;
    isFeatured: boolean;
    isPinned: boolean;
    tags: Array<string>;
    genres: Array<string>;
    languages: Array<string>;
    createdAt: string;
    updatedAt: string;
}
