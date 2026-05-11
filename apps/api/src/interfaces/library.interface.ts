import { Document, Types } from 'mongoose';
import IListenerDoc from './listener.interface';
import IMinisterDoc from './minister.interface';
import IPlaylistDoc from './playlist.interface';
import ISeriesDoc from './series.interface';
import ISermonDoc from './sermon.interface';
import IUserDoc from './user.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a listener's personal library.
 *
 * The library is a unified collection where a listener saves sermons,
 * playlists, series, and followed ministers. Each saved item is wrapped
 * in a {@link LibraryItem} that carries metadata for sorting, filtering,
 * and flag states (liked, downloaded, pinned, favourite).
 *
 * A listener has exactly one library; it is created when the listener
 * profile is provisioned.
 */
interface ILibraryDoc extends Document {
    /** Short unique code. */
    code: string;
    /** URL-safe slug. */
    slug: string;

    /** The listener who owns this library. */
    listener: IListenerDoc | any;

    /** All saved items in the library. */
    items: Array<LibraryItem>;

    /** Cached count of saved sermons. */
    sermonCount: number;
    /** Cached count of saved playlists. */
    playlistCount: number;
    /** Cached count of saved series. */
    seriesCount: number;
    /** Cached count of followed ministers. */
    ministerCount: number;

    /** ISO-8601 timestamp of the last client sync. */
    lastSyncedAt: string;
    /** Monotonically increasing version for offline sync conflict resolution. */
    syncVersion: number;

    /** The user who created this library. */
    createdBy: IUserDoc | any;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/** Discriminator for the type of content saved in the library. */
export enum LibraryItemType {
    SERMON = 'sermon',
    PLAYLIST = 'playlist',
    SERIES = 'series',
    MINISTER = 'minister',
}

/** How the item was discovered before being saved. */
export enum LibraryItemAddedFrom {
    SEARCH = 'search',
    PLAYLIST = 'playlist',
    RECOMMENDATION = 'recommendation',
    MANUAL = 'manual',
}

/**
 * A single entry in a listener's library.
 *
 * Only one of the reference fields (`sermon`, `playlist`, `series`,
 * `minister`) is populated, determined by {@link type}.
 */
export interface LibraryItem {
    /** Unique item identifier. */
    id: string;
    /** Discriminator for which reference field is populated. */
    type: LibraryItemType;

    /** Populated when `type` is `SERMON`. */
    sermon: ISermonDoc;
    /** Populated when `type` is `PLAYLIST`. */
    playlist: IPlaylistDoc;
    /** Populated when `type` is `SERIES`. */
    series: ISeriesDoc;
    /** Populated when `type` is `MINISTER`. */
    minister: IMinisterDoc;

    /** ISO-8601 timestamp when the item was saved. */
    addedAt: string;
    /** How the item was discovered. */
    addedFrom: LibraryItemAddedFrom;
    /** Manual sort order (lower = higher priority). */
    sortOrder: number;

    /** Boolean flags for quick filtering. */
    flags: {
        /** Whether the listener has liked this item. */
        liked: boolean;
        /** Whether the item has been downloaded for offline use. */
        downloaded: boolean;
        /** Whether the item is pinned to the top. */
        pinned: boolean;
        /** Whether the item is marked as a favourite. */
        favourite: boolean;
    };
}

export default ILibraryDoc;
