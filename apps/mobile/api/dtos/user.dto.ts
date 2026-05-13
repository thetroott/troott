/**
 * User request/response DTOs aligned with `apps/api/src/dtos/user.dto.ts`.
 * Types reference `@/models` for enums and shared shapes.
 */
import type { ApiUpload, ICountry } from '@/models/_api-types';
import type { UserLocation } from '@/models/User.model';
import {
    PasswordType,
    UserType,
} from '@/models/User.model';

export interface createUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordType: PasswordType;
    userType: UserType;
    createdBy?: string;
}

export interface createUserProfileDTO {
    email: string;
    userType: UserType;
    createdBy?: string;
    role?: string;
    permissions?: Array<string>;
}

export interface inviteUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType: UserType;
    role?: string;
    permissions?: Array<string>;
}

export interface EditUserDTO {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    altPhone?: string;
    location?: Partial<UserLocation>;
    country?: ICountry | string;
    homeCountry?: ICountry | string;
    avatar?: ApiUpload | string;
    banner?: ApiUpload | string;
    slug?: string;
    dateOfBirth?: Date;
    gender?: string;
    isActive?: boolean;
}

export interface UserProfileDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    slug?: string;
    phoneNumber?: string;
    phoneCode?: string;
    avatar?: string;
    banner?: string;
    country?: string;
    gender?: string;
    dateOfBirth?: Date;
    isActive?: boolean;
    userType?: UserType;
    roles?: string[];
}

/** Compact user summary (API `UserDTO`). */
export interface UserDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    slug: string;

    phoneNumber?: string;
    phoneCode?: string;
    country?: string;

    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;

    userType: UserType;
    isSuper: boolean;
    isAdmin: boolean;
    isUser: boolean;
    isListener: boolean;
    isMinister: boolean;
    isCreator: boolean;

    isActive: boolean;
    isLocked: boolean;
    lockedUntil: Date | null;
}

export interface UserResponseDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    slug: string;

    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    altPhone?: string;
    country?: ICountry;
    homeCountry?: ICountry;
    location?: UserLocation;

    avatar?: ApiUpload;
    banner?: ApiUpload;
    gender?: string;
    dateOfBirth?: Date;

    userType: UserType;
    isSuper: boolean;
    isAdmin: boolean;
    isUser: boolean;
    isListener: boolean;
    isMinister: boolean;
    isCreator: boolean;

    isActive: boolean;
    isActivated: boolean;
    isDeactivated: boolean;
    isSuspended: boolean;
    isLocked: boolean;
    lockedUntil: Date | null;

    roles?: string[];
    inviteStatus?: string;

    createdAt: string;
    updatedAt: string;
}

export interface IBulkUser {
    email: string;
    password: string;
    passwordType: PasswordType;
    userType: UserType;
    createdBy?: string;
}

export interface IPassportProfileDTO {
    id: string;
    emails: { value: string }[];
    name: { givenName: string; familyName: string };
    picture: string;
}

export interface createSocialUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    userType: UserType;
    googleId?: string;
    githubId?: string;
    appleId?: string;
}
