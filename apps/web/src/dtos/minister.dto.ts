import type { ICountry } from '@/utils/interfaces.util';
import type { ILocation } from './common-fields';
import { MinisterStatus, VerificationStatus } from './api-domain';
import type { ISocials } from './api-domain';
import { UserType } from '@/models/User.model';

/** Identity document types for minister verification (mirror API `DocumentType`). */
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

export interface SubmitMinisterVerificationDTO {
    document: DocumentUpload;
}

export type OnboardMinisterPersonalCompleteDTO = Record<string, never>;

export type OnboardMinisterDocumentCompleteDTO = Record<string, never>;

export type OnboardMinisterAddressCompleteDTO = Record<string, never>;

export type OnboardMinisterMinistryCompleteDTO = Record<string, never>;

export type OnboardMinisterTourCompleteDTO = Record<string, never>;

export type OnboardMinisterFirstSermonCompleteDTO = Record<string, never>;

export interface OnboardMinisterSkipDTO {
    reason?: string;
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
        ministryHQLocation?: Partial<Pick<ILocation, 'city' | 'state' | 'address'>>;
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
        ministryHQLocation?: Pick<ILocation, 'city' | 'state' | 'address'>;
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
    ministryHQLocation?: Pick<ILocation, 'city' | 'state' | 'address'>;
    ministryWebsite?: string;
    socials?: ISocials[];
    languages?: string[];
    monthlyListeners?: number;
    isVerified?: boolean;
    isPublic?: boolean;
    createdAt: string;
    updatedAt: string;
}
