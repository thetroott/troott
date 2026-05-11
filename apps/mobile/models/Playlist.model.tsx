import Listener from './Listener.model';
import Minister from './Minister.model';
import Series from './Series.model';
import Sermon from './Sermon.model';
import User from './User.model';

interface Playlist {
    // Identity
    code: string;
    slug: string;

    // Basic Information
    title: string;
    description: string;
    banner: string;

    // Content
    items: Array<PlaylistItem>;
    itemsCount: number;
    totalDurationMs: number;

    // Visibility and Status
    status: PlaylistStatus;
    visibility: PlaylistVisibility;
    playlistType: PlaylistType; // What kind of playlist is this?

    // Ownership
    ownerType: PlaylistOwnerType; // Who owns this playlist?
    owner: User | any; // If created by the system admin or super admin
    listener: Listener | any;
    minister: Minister | any;

    // Collaboration
    isCollaborative: boolean;
    collaborators: Array<User | any>;

    // Engagement
    likesCount: number;
    savesCount: number;
    followersCount: number;
    sharesCount: number;
    playsCount: number;

    // Flags
    isPublic: boolean;
    isFeatured: boolean; // promote dby the platform
    isPinned: boolean;

    // Personalization
    tags: Array<string>;
    genres: Array<string>;
    languages: Array<string>;

    user: User | any;
    createdBy: User | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export interface PlaylistItem {
    item: Sermon | Series | any;
    position: number;
    addedAt: string;
    addedBy: User | any;
}

export enum PlaylistType {
    MINISTER = 'minister',
    LISTENER = 'listener',
    SYSTEM = 'system',
    RECOMMENDATION = 'recommendation',
}

export enum PlaylistOwnerType {
    LISTENER = 'listener',
    MINISTER = 'minister',
    SYSTEM = 'system',
}

export enum PlaylistVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    UNLISTED = 'unlisted',
}

export enum PlaylistStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    DELETED = 'deleted',
}

export default Playlist;
