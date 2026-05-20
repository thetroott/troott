import {
    PlaylistOwnerType,
    PlaylistStatus,
    PlaylistType,
    PlaylistVisibility,
} from '@/dtos/api-domain';

export interface PlaylistItemMedia {
    id: string;
    title: string;
    imageUrl?: string;
    duration?: number;
    minister?: string;
}

export interface PlaylistItem {
    id: string;
    item: PlaylistItemMedia;
    position: number;
    addedAt: string;
}

export interface PlaylistOwnerRef {
    id: string;
    name: string;
}

export interface Playlist {
    id: string;
    code: string;
    slug: string;
    title: string;
    description: string;
    banner: string;
    items: PlaylistItem[];
    itemsCount: number;
    totalDurationMs: number;
    status: PlaylistStatus;
    visibility: PlaylistVisibility;
    playlistType: PlaylistType;
    ownerType: PlaylistOwnerType;
    owner?: PlaylistOwnerRef;
    listener?: PlaylistOwnerRef;
    minister?: PlaylistOwnerRef;
    isCollaborative: boolean;
    likesCount: number;
    savesCount: number;
    followersCount: number;
    sharesCount: number;
    playsCount: number;
    isPublic: boolean;
    isFeatured: boolean;
    isPinned: boolean;
    tags: string[];
    genres: string[];
    languages: string[];
    createdAt: string;
    updatedAt: string;
    _version?: number;
    _id?: string;
}

export default Playlist;
