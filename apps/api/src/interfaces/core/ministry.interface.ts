import { Document, Types } from 'mongoose';
import { ICountry } from '../common.interface';
import IUserDoc from '../user.interface';
import IMinisterDoc from './minister.interface';

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
interface IMinistryDoc extends Document {
    code: string;
    /** URL-safe slug. */
    slug: string;
    /** Display name (e.g. "RCCG", "Anglican Diocese of Ibadan"). */
    name: string;

    /** About / mission statement. */
    description: string;
    /** CDN URL — square logo. */
    logo: string;
    /** CDN URL — cover / banner. */
    banner: string;

    /** Country of residence. */
    country: ICountry;
    /** CDN URL of the minister's avatar. */
    avatar: string;
    /** Registration email address. */
    email: string;

    /** Primary phone number. */
    phoneNumber: string;
    /** International dialling code. */
    phoneCode: string;
    /** Country associated with the phone number. */

    headquarters: ILocation;
    /** Ministry website URL. */
    websiteUrl: string;
    /** Social media links. */
    socials: Array<ISocials>;
    /** Languages the minister preaches in. */
    languages: Array<string>;

    /** Denomination or tradition (e.g. Pentecostal, Charismatic). */
    ministryType: ministryType;

    /** Admin KYC / trust review passed. */
    verified: boolean;
    /** Account-level status. */
    status: MinistryStatus;
    /** Whether the minister's profile is published to the public directory. */
    published: boolean;

    /** The user who created this minister record. */
    createdBy: IUserDoc | any;
    /** Ministry members. */
    members: Array<IMinisterDoc | any>;

    /** Reference to the minister's settings document. */
    settings: string | any;

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
export enum MinistryStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING_REVIEW = 'pending_review',
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

export enum ministryType {
    BAPTIST = 'baptist',
    ANGLICAN = 'anglican',
    METHODIST = 'methodist',
    CATHOLIC = 'catholic',
    ORTHODOX = 'orthodox',
    REFORMED = 'reformed',
    EVANGELICAL = 'evangelical',
    CHARISMATIC = 'charismatic',
    NON_DENOMINATIONAL = 'non_denominational',
    PENTECOSTAL = 'pentecostal',
}

export type { IMinistryDoc };
export default IMinistryDoc;
