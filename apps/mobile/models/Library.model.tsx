import Listener from './Listener.model';
import Minister from './Minister.model';
import Playlist from './Playlist.model';
import Series from './Series.model';
import Sermon from './Sermon.model';
import User from './User.model';

interface Library {
    // Identity
    code: string;
    slug: string;

    // Ownership
    listener: Listener | any;

    // User-curated collections
    items: Array<LibraryItem>;

    // Quick filters (cached)
    sermonCount: number;
    playlistCount: number;
    seriesCount: number;
    ministerCount: number;

    // Sync
    lastSyncedAt: string;
    syncVersion: number;

    createdBy: User | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export enum LibraryItemType {
    SERMON = 'sermon',
    PLAYLIST = 'playlist',
    SERIES = 'series',
    MINISTER = 'minister',
}

export enum LibraryItemAddedFrom {
    SEARCH = 'search',
    PLAYLIST = 'playlist',
    RECOMMENDATION = 'recommendation',
    MANUAL = 'manual',
}

export interface LibraryItem {
    id: string;
    type: LibraryItemType;

    // references (only one will be used depending on type)
    sermon: Sermon;
    playlist: Playlist;
    series: Series;
    minister: Minister;

    // metadata for sorting/filtering
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

export default Library;
