import type { ICountry } from '@/utils/interfaces.util';
import type { ILocation } from '@/dtos/common-fields';
import { MinisterStatus, VerificationStatus } from '@/dtos/api-domain';
import type { ISocials } from '@/dtos/api-domain';

export interface MinisterProfile {
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
}

export interface MinisterVerification {
    status: VerificationStatus;
    isVerified: boolean;
    isPublic: boolean;
    verifiedAt?: Date;
}

export interface MinisterOnboarding {
    step: number;
    status: string;
}

export interface Minister {
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
    profile?: MinisterProfile;
    onboarding?: MinisterOnboarding;
    verification?: MinisterVerification;
    status: MinisterStatus;
    published: boolean;
    monthlyListeners: number;
    createdAt: string;
    updatedAt: string;
    _version?: number;
    _id?: string;
}

export default Minister;
