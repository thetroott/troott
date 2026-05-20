import { Document, Types } from 'mongoose';
import { ICountry } from '../common.interface';
import IPlaylistDoc from './playlist.interface';
import ISermonDoc from './sermon.interface';
import ITransactionDoc from '../transaction.interface';
import IUserDoc from '../user.interface';
import { VerificationStatus } from './minister.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a creator profile.
 *
 * Creators are a general-purpose content-producer role similar to
 * {@link IMinisterDoc} but without a formal ministry affiliation.
 * They upload sermons, curate playlists, and go through the same
 * identity verification flow.
 */
interface ICreatorDoc extends Document {
    /** Public creator code. */
    code: string;

    /** First name. */
    firstName: string;
    /** Last name. */
    lastName: string;
    /** Middle name. */
    middleName: string;
    /** Gender identity. */
    gender: string;
    /** Date of birth. */
    dateOfBirth: Date;
    /** Primary phone number. */
    phoneNumber: string;
    /** International dialling code. */
    phoneCode: string;
    /** Country associated with the phone number. */
    countryPhone: string;
    /** Country of residence. */
    country: ICountry;
    /** Country of origin / nationality. */
    homeCountry: ICountry;

    /** CDN URL of the creator's avatar. */
    avatar: string;
    /** CDN URL of the creator's banner image. */
    banner: string;
    /** URL-safe slug. */
    slug: string;
    /** Registration email address. */
    email: string;

    /** Public-facing creator profile. */
    profile: {
        /** Display name shown on the platform. */
        displayName: string;
        /** Short biography. */
        description: string;
        /** Unique username handle. */
        username: string;
        /** Personal website URL. */
        websiteUrl: string;
        /** Social media links. */
        socials: Array<ISocials>;
        /** Languages the creator produces content in. */
        languages: Array<string>;
    };
    /** Onboarding progress tracker. */
    onboarding: {
        /** Current step index. */
        step: number;
        /** Descriptive status. */
        status: string;
    };

    /** Identity verification state. */
    verification: {
        /** Uploaded identity document. */
        document: DocumentUpload;
        /** Current verification status. */
        status: VerificationStatus;
        /** When verification was approved or rejected. */
        verifiedAt: Date;
        /** Admin who processed the verification. */
        verifiedBy: IUserDoc | any;
        /** Whether the creator has passed verification. */
        isVerified: boolean;
        /** Whether the profile is publicly visible (only `true` after verification). */
        isPublic: boolean;
    };
    /** Account-level status. */
    status: CreatorStatus;
    /** Whether the creator's profile is published to the public directory. */
    published: boolean;

    /** Rolling count of unique listeners in the last 30 days. */
    monthlyListeners: number;

    /** Reference to the creator's settings document. */
    settings: string | any;
    /** Active subscription reference. */
    subscription: string | any;
    /** Underlying authentication user reference. */
    user: string | any;

    /** Linked studio channel (producer hub). */
    studio?: ObjectId | any;

    /** Sermons uploaded by this creator. */
    sermons: Array<ISermonDoc | any>;
    /** Playlists curated by this creator. */
    playlists: Array<IPlaylistDoc | any>;
    /** Payment transactions. */
    transactions: Array<ITransactionDoc | any>;
    /** The user who created this creator record. */
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

/** Social media profile link. */
export interface ISocials {
    /** Platform name (e.g. `twitter`, `instagram`). */
    name: string;
    /** Full profile URL. */
    url: string;
    /** Handle / username on the platform. */
    username: string;
}

/** Structured physical address. */
export interface ILocation {
    /** City name. */
    city: string;
    /** State or province. */
    state: string;
    /** Street address. */
    address: string;
}

/** Account-level status for a creator. */
export enum CreatorStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

/** Government-issued identity document types accepted for verification. */
export enum DocumentType {
    NIN = 'national_identity_number',
    DRIVERS = 'drivers_license',
    PASSPORT = 'international_passport',
}

/** An uploaded identity document with front (and optional back) page. */
export interface DocumentUpload {
    /** Type of identity document. */
    type: DocumentType;
    /** CDN URL of the front page scan. */
    frontPage: string;
    /** CDN URL of the back page scan (if applicable). */
    backPage?: string;
}

export type { ICreatorDoc };
export default ICreatorDoc;
