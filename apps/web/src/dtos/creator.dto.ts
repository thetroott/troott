import type { ICountry } from '@/utils/interfaces.util';
import { VerificationStatus } from './api-domain';
import type { ISocials } from './api-domain';
import type { DocumentUpload } from './minister.dto';

export enum CreatorStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

export type OnboardCreatorPersonalCompleteDTO = Record<string, never>;
export type OnboardCreatorDocumentCompleteDTO = Record<string, never>;
export type OnboardCreatorAddressCompleteDTO = Record<string, never>;
export type OnboardCreatorMinistryCompleteDTO = Record<string, never>;
export type OnboardCreatorTourCompleteDTO = Record<string, never>;
export type OnboardCreatorFirstSermonCompleteDTO = Record<string, never>;

export interface OnboardCreatorSkipDTO {
    reason?: string;
}

export interface SubmitCreatorVerificationDTO {
    document: DocumentUpload;
}

export interface UpdateCreatorDTO {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phoneNumber?: string;
    phoneCode?: string;
    country?: ICountry | string;
    homeCountry?: ICountry | string;
    countryPhone?: string;
    avatar?: string;
    banner?: string;
    dateOfBirth?: Date;
    gender?: string;
    slug?: string;
    profile?: {
        displayName?: string;
        description?: string;
        username?: string;
        websiteUrl?: string;
        socials?: ISocials[];
        languages?: string[];
    };
    onboarding?: { step?: number; status?: string };
}

export interface CreatorResponseDTO {
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
        displayName?: string;
        description?: string;
        username?: string;
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
    status: CreatorStatus;
    published: boolean;
    monthlyListeners: number;
    createdAt: string;
    updatedAt: string;
}
