import { Document, Types } from 'mongoose';

import type IMinisterDoc from './minister.interface';
import type ISermonDoc from './sermon.interface';
import type ISeriesDoc from './series.interface';
import type IPlaylistDoc from './playlist.interface';
import type IUserDoc from '../user.interface';
import type ITopicDoc from './topic.interface';
import { ISocials } from './minister.interface';
import { ICountry } from '../common.interface';
import { ILocation } from '../user.interface';

type ObjectId = Types.ObjectId;

/**
 * A Studio is a content brand or branch (YouTube-style channel).
 * Sermons, series, and playlists are published under this identity.
 */
interface IStudioDoc extends Document {
    code: string;
    /** URL-safe slug. */
    slug: string;
    name: string;

    /** Country of residence. */
    country: ICountry;

    /** CDN URL of the minister's avatar. */
    avatar: string;

    /** Registration email address. */
    email: string;

    /** Public-facing ministry profile. */
    profile: {
        /** Short biography or mission statement. */
        description: string;
        /** Official ministry organisation name. */
        ministryName: string;
        /** CDN URL of the ministry logo. */
        ministryLogo: string;
        /** Denomination or tradition (e.g. Pentecostal, Charismatic). */
        /** CDN URL of the ministery's banner image. */
        banner: string;
        ministryType: string;
        /** Physical location of the ministry headquarters. */
        ministryHQLocation: ILocation;
        /** Public phone number. */
        phoneNumber: string;
        /** Public phone dialling code. */
        phoneCode: string;
        /** Country of the public phone. */
        countryPhone: string;
        /** Public email address. */
        email: string;
        /** Ministry website URL. */
        websiteUrl: string;
        /** Social media links. */
        socials: Array<ISocials>;
        /** Languages the minister preaches in. */
        languages: Array<string>;

        members: Array<IMinisterDoc>;
    };

    parentStudio?: IStudioDoc | any;

    category: StudioType;
    isPublic: boolean;
    isVerified: boolean;

    sermons: Array<ISermonDoc | any>;
    series: Array<ISeriesDoc | any>;
    playlists: Array<IPlaylistDoc | any>;

    members: Array<StudioMember>; // users who are members of the studio who are not ministers
    invites: Array<StudioInvite>;

    followers: number;
    totalListeners: number;
    monthlyListeners: number;
    totalSermons: number;
    totalSeries: number;
    totalPlays: number;

    tags: Array<string>;
    topics: Array<ITopicDoc>;

    status: StudioStatus;

    createdBy: IUserDoc | any;

    createdAt: Date;
    updatedAt: Date;
    _id: ObjectId;
    id: ObjectId;
}

export enum StudioType {
    CHURCH_BRANCH = 'church_branch',
    MINISTRY = 'ministry',
    PODCAST = 'podcast',
    MUSIC = 'music',
    CONFERENCE = 'conference',
    DEVOTIONAL = 'devotional',
    MEDIA_NETWORK = 'media_network',
    PERSONAL = 'personal',
}

export interface IStudioSocial {
    name: string;
    url: string;
    username?: string;
}

export interface StudioMember {
    user: ObjectId | IUserDoc;
    role: StudioRole;
    joinedAt: Date;
    invitedBy?: ObjectId;
    permissions: Array<string>;
}

export interface StudioInvite {
    user?: ObjectId;
    email?: string;
    role: StudioRole;
    invitedBy: ObjectId;
    invitedAt: Date;
    expiresAt?: Date;
}

export enum StudioRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    EDITOR = 'editor',
    UPLOADER = 'uploader',
    ANALYST = 'analyst',
}

export enum StudioStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING_REVIEW = 'pending_review',
}

export type { IStudioDoc };
export default IStudioDoc;
