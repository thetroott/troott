import { LibraryItemAddedFrom, LibraryItemType } from './api-domain';

export interface AddLibraryItemDTO {
    type: LibraryItemType;
    itemId: string;
    addedFrom: LibraryItemAddedFrom;
}

export interface RemoveLibraryItemDTO {
    itemId: string;
    type: LibraryItemType;
}

export interface UpdateLibraryItemFlagsDTO {
    itemId: string;
    type: LibraryItemType;
    flags: {
        liked?: boolean;
        downloaded?: boolean;
        pinned?: boolean;
        favourite?: boolean;
    };
}

export interface LibraryItemResponseDTO {
    id: string;
    type: LibraryItemType;
    item: {
        id: string;
        title: string;
        imageUrl?: string;
        duration?: number;
    };
    addedAt: string;
    addedFrom: LibraryItemAddedFrom;
    sortOrder: number;
    flags: {
        liked: boolean;
        downloaded: boolean;
        pinned: boolean;
        favourite: boolean;
    };
}

export interface LibraryResponseDTO {
    id: string;
    code: string;
    sermonCount: number;
    playlistCount: number;
    seriesCount: number;
    ministerCount: number;
    items: Array<LibraryItemResponseDTO>;
    lastSyncedAt: string;
    syncVersion: number;
}
