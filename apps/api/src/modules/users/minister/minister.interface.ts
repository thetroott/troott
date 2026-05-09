import { Document, Types } from 'mongoose';
import { Upload } from '../user/user.interface';

type ObjectId = Types.ObjectId;

export interface IMinisterDoc extends Document {
    code: string; // user public ID
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    phoneCode: string;
    country: string;
    countryPhone: string;

    avatar: string;
    dateOfBirth: Date;
    gender: string;
    slug: string;

    docVerification: DocumentUpload;
    verificationStatus: VerificationStatus;
    verifiedAt: Date;
    isPublic: boolean; // Only set to true AFTER verification

    /** @deprecated legacy single-string field; prefer `ministryName`. */
    ministry?: string;
    ministerialName: string;
    ministryName: string;
    description: string;
    ministryHQLocation: string;
    ministryWebsite: string;
    socials: IProfileSocials;

    sermons: Array<ObjectId | any>;
    featuredSermons: Array<ObjectId | any>;
    bites: Array<ObjectId | any>;
    topSermons: Array<ObjectId | any>;
    topBites: Array<ObjectId | any>;

    playlists: Array<ObjectId | any>;
    featuredPlaylists: Array<ObjectId | any>;

    followers: Array<ObjectId | any>;
    monthlyListeners: number;
    likes: number;
    shares: number;

    uploads: Array<ObjectId | any>;
    uploadHistory: Array<ObjectId | any>;
    deletedSermons: Array<{
        id: ObjectId;
        deletedBy: ObjectId | any;
        deletedAt: Date;
        reason?: string;
    }>;

    accountManagers: Array<{ userId: ObjectId; role: AccountManagerRole }>;

    user: ObjectId | any;
    transactions: Array<ObjectId | any>;
    createdBy: ObjectId | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export enum DocumentType {
    NIN = 'national_identity_number',
    DRIVERS = 'drivers_license',
    PASSPORT = 'international_passport',
}

export interface DocumentUpload {
    type: DocumentType;
    frontPage: Upload;
    backPage?: Upload;
}

export interface ISocials {
    name: string;
    url: string;
    username: string;
}

/**
 * Structured social handles surfaced on the minister profile editor.
 * Matches the three platforms in Figma node 11719:104736.
 */
export interface IProfileSocials {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
}

export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    UNDER_REVIEW = 'under-review',
    NEEDS_REVISION = 'needs-revision',
    SUSPENDED = 'suspended',
}

export enum AccountManagerRole {
    OWNER = 'owner',
    MANAGER = 'manager',
    EDITOR = 'editor',
    ANALYST = 'analyst',
}
