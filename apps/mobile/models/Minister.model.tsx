import type { ICountry } from './_api-types';
import Playlist from './Playlist.model';
import Sermon from './Sermon.model';
import type Subscription from './Subscription.model';
import Transaction from './Transaction.model';
import User from './User.model';

/** Aligned with `apps/api/src/interfaces/core/minister.interface.ts` `ILocation`. */
export interface ILocation {
    city: string;
    state: string;
    address: string;
}

export interface ISocials {
    name: string;
    url: string;
    username: string;
}

/**
 * Minister identity verification (aligned with API `minister.interface` `VerificationStatus`).
 * Distinct from listener/user verification enums elsewhere.
 */
export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

interface Minister {
    code: string;

    firstName: string;
    lastName: string;
    middleName: string;
    gender: string;
    dateOfBirth: Date;
    phoneNumber: string;
    phoneCode: string;
    countryPhone: string;
    country: ICountry;
    homeCountry: ICountry;

    avatar: string;
    banner: string;
    slug: string;
    email: string;

    profile: {
        description: string;
        ministerialName: string;
        ministryName: string;
        ministryLogo: string;
        ministryType: string;
        ministryHQLocation: ILocation;
        phoneNumber: string;
        phoneCode: string;
        countryPhone: string;
        email: string;
        websiteUrl: string;
        socials: Array<ISocials>;
        languages: Array<string>;
    };
    onboarding: {
        step: number;
        status: string;
    };

    verification: {
        document: DocumentUpload;
        status: VerificationStatus;
        verifiedAt: Date;
        verifiedBy: User | any;
        isVerified: boolean;
        isPublic: boolean;
    };
    status: MinisterStatus;
    published: boolean;

    monthlyListeners: number;

    settings: string | any;
    subscription: Subscription | any;
    user: User | any;

    sermons: Array<Sermon | any>;
    playlists: Array<Playlist | any>;
    transactions: Array<Transaction | any>;
    createdBy: User | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export enum MinisterStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

export enum DocumentType {
    NIN = 'national_identity_number',
    DRIVERS = 'drivers_license',
    PASSPORT = 'international_passport',
}

export interface DocumentUpload {
    type: DocumentType;
    frontPage: string;
    backPage?: string;
}

export default Minister;
