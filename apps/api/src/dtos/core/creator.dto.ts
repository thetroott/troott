import IUserDoc, { UserType } from '@/interfaces/user.interface';
import { ICountry } from '@/interfaces/common.interface';
import { VerificationStatus } from '@/interfaces/core/minister.interface';
import {
    CreatorStatus,
    DocumentUpload,
    ISocials,
} from '@/interfaces/core/creator.interface';

export interface CreateCreatorDTO {
    user: IUserDoc;
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

/** Milestone bodies for `POST /creator/onboarding/*`. */
export interface OnboardCreatorPersonalCompleteDTO {
    acknowledged?: boolean;
}

export interface OnboardCreatorDocumentCompleteDTO {
    acknowledged?: boolean;
}

export interface OnboardCreatorAddressCompleteDTO {
    acknowledged?: boolean;
}

export interface OnboardCreatorMinistryCompleteDTO {
    acknowledged?: boolean;
}

export interface OnboardCreatorTourCompleteDTO {
    acknowledged?: boolean;
}

export interface OnboardCreatorFirstSermonCompleteDTO {
    acknowledged?: boolean;
}

export interface OnboardCreatorSkipDTO {
    reason?: string;
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
    avatar?: string | null;
    coverImage?: string | null;
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
    avatar?: string | null;
    coverImage?: string | null;
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
