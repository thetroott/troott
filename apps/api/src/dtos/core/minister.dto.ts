import { ObjectId } from 'mongoose';
import IUserDoc, { UserType } from '@/interfaces/user.interface';
import {
    DocumentUpload,
    ILocation,
    ISocials,
    MinisterStatus,
    VerificationStatus,
} from '@/interfaces/core/minister.interface';
import { ICountry } from '@/interfaces/common.interface';

export interface CreateMinisterDTO {
    user: IUserDoc;
    userType: UserType.MINISTER;
    email: string;
    createdBy: ObjectId | any;
}

export interface UpdateMinisterDTO {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    gender?: string;
    avatar?: string;
    banner?: string;
    dateOfBirth?: Date;
    country?: ICountry | string;
    homeCountry?: ICountry | string;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    slug?: string;
    profile?: {
        description?: string;
        ministerialName?: string;
        ministryName?: string;
        ministryLogo?: string;
        ministryType?: string;
        ministryHQLocation?: Partial<ILocation>;
        phoneNumber?: string;
        phoneCode?: string;
        countryPhone?: string;
        email?: string;
        websiteUrl?: string;
        socials?: ISocials[];
        languages?: string[];
    };
    onboarding?: { step?: number; status?: string };
}

export interface InviteMinisterDTO {
    email: string;
    resourceId?: string;
}

export interface BulkInviteMinistersDTO {
    emails: string[];
    resourceId?: string;
}

export interface AcceptMinisterInvitationDTO {
    token: string;
    email: string;
    password: string;
}

export interface SetMinisterPasswordDTO {
    password: string;
}

export interface SubmitMinisterVerificationDTO {
    document: DocumentUpload;
}

export interface UpdateMinisterVerificationStatusDTO {
    ministerId: string;
    status: VerificationStatus;
}

export interface MinisterProfileDTO {
    id: string;
    code: string;
    userType: UserType.MINISTER;
    firstName: string;
    lastName: string;
    email: string;
    slug?: string;
    bio?: string;
    avatar?: string | null;
    coverImage?: string | null;
    ministerialName?: string;
    ministryName?: string;
    ministryLogo?: string;
    ministryType?: string;
    ministryHQLocation?: ILocation;
    ministryWebsite?: string;
    socials?: ISocials[];
    languages?: string[];
    monthlyListeners?: number;
    isVerified?: boolean;
    isPublic?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateMinisterProfileDTO {
    bio?: string;
    avatar?: string | null;
    coverImage?: string | null;
    ministerialName?: string;
    ministryName?: string;
    ministryLogo?: string;
    ministryType?: string;
    ministryHQLocation?: Partial<ILocation>;
    ministryWebsite?: string;
    socials?: ISocials[];
    languages?: string[];
}

export interface MinisterResponseDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    slug: string;
    gender?: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    country?: ICountry;
    homeCountry?: ICountry;
    avatar?: string;
    banner?: string;
    profile?: {
        description?: string;
        ministerialName?: string;
        ministryName?: string;
        ministryLogo?: string;
        ministryType?: string;
        ministryHQLocation?: ILocation;
        phoneNumber?: string;
        phoneCode?: string;
        countryPhone?: string;
        email?: string;
        websiteUrl?: string;
        socials?: ISocials[];
        languages?: string[];
    };
    onboarding?: { step: number; status: string };
    verification?: {
        status: VerificationStatus;
        isVerified: boolean;
        isPublic: boolean;
        verifiedAt?: Date;
    };
    status: MinisterStatus;
    published: boolean;
    monthlyListeners: number;
    createdAt: string;
    updatedAt: string;
}
