import { Document, Types } from 'mongoose';
import { ICountry } from '../common.interface';
import IPlaylistDoc from './playlist.interface';
import ISermonDoc from './sermon.interface';
import ITransactionDoc from '../transaction.interface';
import IUserDoc from '../user.interface';
import ISubscriptionDoc from '../subscription.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a minister profile.
 *
 * Ministers are the content-producer side of the platform -- they upload
 * sermons, manage series, and build a public ministry presence.
 * Each minister is backed by an {@link IUserDoc} for authentication.
 *
 * The profile goes through a verification flow (document upload + admin
 * review) before the minister becomes publicly visible.
 */
interface IMinisterDoc extends Document {
    /** Public minister code. */
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

    /** CDN URL of the minister's avatar. */
    avatar: string;
    /** CDN URL of the minister's banner image. */
    banner: string;
    /** URL-safe slug. */
    slug: string;
    /** Registration email address. */
    email: string;

    /** Public-facing ministry profile. */
    profile: {
        /** Short biography or mission statement. */
        description: string;
        /** Stage / ministerial name. */
        ministerialName: string;
        /** Official ministry organisation name. */
        ministryName: string;
        /** CDN URL of the ministry logo. */
        ministryLogo: string;
        /** Denomination or tradition (e.g. Pentecostal, Charismatic). */
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
        /** Whether the minister has passed verification. */
        isVerified: boolean;
        /** Whether the profile is publicly visible (only `true` after verification). */
        isPublic: boolean;
    };
    /** Account-level status. */
    status: MinisterStatus;
    /** Whether the minister's profile is published to the public directory. */
    published: boolean;

    /** Rolling count of unique listeners in the last 30 days. */
    monthlyListeners: number;

    /** Reference to the minister's settings document. */
    settings: string | any;
    /** Active subscription. */
    subscription: ISubscriptionDoc | any;
    /** Underlying authentication user. */
    user: IUserDoc | any;

    /** Linked studio channel (producer hub). */
    studio?: ObjectId | any;

    /** Sermons uploaded by this minister. */
    sermons: Array<ISermonDoc | any>;
    /** Playlists curated by this minister. */
    playlists: Array<IPlaylistDoc | any>;
    /** Payment transactions. */
    transactions: Array<ITransactionDoc | any>;

    /** The user who created this minister record. */
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

/** Structured physical address for a ministry HQ. */
export interface ILocation {
    /** City name. */
    city: string;
    /** State or province. */
    state: string;
    /** Street address. */
    address: string;
}

/** Account-level status for a minister. */
export enum MinisterStatus {
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

/** Admin review status for a minister's identity verification. */
export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export type { IMinisterDoc };
export default IMinisterDoc;
