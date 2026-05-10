import { Document, Types } from 'mongoose';
import { IUserDoc, Upload } from '../user/user.interface';
import { ITransactionDoc } from '@/modules/payments/transaction/transaction.interface';
import { IPlaylistDoc } from '@/modules/core/playlist/playlist.interface';
import { ISermonDoc } from '@/utils/interfaces.util';

type ObjectId = Types.ObjectId;

export interface IMinisterDoc extends Document {
    code: string; // user public ID
    firstName: string;
    lastName: string;
    middleName: string;
    gender: string;
    dateOfBirth: Date;
    phoneNumber: string;
    phoneCode: string;
    countryPhone: string;

    avatar: string;
    banner: string;
    slug: string;
    email: string;

    profile: {
        description: string;
        ministerialName: string;
        ministryName: string;
        ministryLogo: string;
        ministryType: string; // Pentecostal, Charismatic, etc.
        ministryHQLocation: string;
        phoneNumber: string;
        phoneCode: string;
        countryPhone: string;
        email: string;
        websiteUrl: string;
        socials: Array<ISocials>; // Instagram, Twitter, TikTok, etc.
        languages: Array<string>;
    };

    onboarding: {
        step: number;
        status: string;
    };
    location: {
        city: string;
        state: string;
        address: string;
    };
    verification: {
        document: DocumentUpload;
        status: VerificationStatus;
        verifiedAt: Date;
        isPublic: boolean; // Only set to true AFTER verification
    };
    status: MinisterStatus;
    published: boolean;

    monthlyListeners: number;

    settings: string | any;
    subscription: string | any;
    user: IUserDoc | any;

    sermons: Array<ISermonDoc | any>;
    playlists: Array<IPlaylistDoc | any>;
    transactions: Array<ITransactionDoc | any>;

    createdBy: IUserDoc | any;

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

export enum MinisterStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
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
