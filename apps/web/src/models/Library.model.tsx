import { LibraryItemAddedFrom, LibraryItemType } from '@/dtos/api-domain';

export interface LibraryItemMedia {
    id: string;
    title: string;
    imageUrl?: string;
    duration?: number;
}

export interface LibraryItemFlags {
    liked: boolean;
    downloaded: boolean;
    pinned: boolean;
    favourite: boolean;
}

export interface LibraryItem {
    id: string;
    type: LibraryItemType;
    item: LibraryItemMedia;
    addedAt: string;
    addedFrom: LibraryItemAddedFrom;
    sortOrder: number;
    flags: LibraryItemFlags;
}

export interface Library {
    id: string;
    code: string;
    sermonCount: number;
    playlistCount: number;
    seriesCount: number;
    ministerCount: number;
    items: LibraryItem[];
    lastSyncedAt: string;
    syncVersion: number;
    createdBy?: string;
    _version?: number;
    _id?: string;
}

export default Library;
