import { VerificationStatus } from '@/utils/enums.util';
import { ICountry } from '../utils/interfaces.util';
import Playlist from './Playlist.model';
import Sermon from './Sermon.model';
import Transaction from './Transaction.model';
import User from './User.model';

interface Minister {
    code: string; // user public ID
    
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
    email: string; // the registration email of the minister

    profile: {
        description: string;
        ministerialName: string;
        ministryName: string;
        ministryLogo: string;
        ministryType: string; // Pentecostal, Charismatic, etc.
        ministryHQLocation: ILocation;
        phoneNumber: string; // the public phone number of the minister
        phoneCode: string;
        countryPhone: string; // the publicphone code of the minister
        email: string; // the public email of the minister
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
        isPublic: boolean; // Only set to true AFTER verification
    };
    status: MinisterStatus;
    published: boolean;

    monthlyListeners: number;

    settings: string | any;
    subscription: string | any;
    user: string | any;

    sermons: Array<Sermon | any>;
    playlists: Array<Playlist | any>;
    transactions: Array<Transaction | any>;
    createdBy: User | any;

    // time stamps
    createdAt: string;
    updatedAt: string;

    // unique ids
    _version: number;
    _id: string;
    id: string;
}

export interface ISocials {
    name: string;
    url: string;
    username: string;
}

export interface ILocation {
    city: string;
    state: string;
    address: string;
};

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
