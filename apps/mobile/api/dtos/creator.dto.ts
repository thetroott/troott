/**
 * Creator DTOs — aligned with `apps/api/src/dtos/core/creator.dto.ts`
 * and `interfaces/core/creator.interface.ts`.
 */
import type { ApiUpload, ICountry } from '@/models/_api-types';
import type { DocumentUpload, ISocials } from '@/models/Minister.model';
import { VerificationStatus } from '@/models/Minister.model';
import { UserType } from '@/models/User.model';

export enum CreatorStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

export interface CreateCreatorDTO {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    phoneCode?: string;
    country?: string;
    countryPhone?: string;
    avatar?: string;
    banner?: string;
    dateOfBirth?: Date;
    gender?: string;
    slug?: string;
    createdBy?: string;
    profile?: {
        displayName?: string;
        description?: string;
        username?: string;
        websiteUrl?: string;
        socials?: ISocials[];
        languages?: string[];
    };
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

export interface InviteCreatorDTO {
    email: string;
    resourceId?: string;
}

export interface AcceptCreatorInvitationDTO {
    token: string;
    email: string;
    password: string;
}

export interface SetCreatorPasswordDTO {
    password: string;
}

export interface SubmitCreatorVerificationDTO {
    document: DocumentUpload;
}

export interface UpdateCreatorVerificationStatusDTO {
    creatorId: string;
    status: VerificationStatus;
}

export interface CreatorProfileDTO {
    id: string;
    code: string;
    userType: UserType.CREATOR;
    firstName: string;
    lastName: string;
    email: string;
    slug?: string;
    bio?: string;
    avatar?: ApiUpload | null;
    coverImage?: ApiUpload | null;
    displayName?: string;
    username?: string;
    websiteUrl?: string;
    socials?: ISocials[];
    languages?: string[];
    monthlyListeners?: number;
    isVerified?: boolean;
    isPublic?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCreatorProfileDTO {
    bio?: string;
    avatar?: ApiUpload | null;
    coverImage?: ApiUpload | null;
    displayName?: string;
    username?: string;
    websiteUrl?: string;
    socials?: ISocials[];
    languages?: string[];
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
