import type { ICountry } from '@/utils/interfaces.util';
import type { ILocation, Upload } from './common-fields';
import { UserType } from '@/models/User.model';

export enum PasswordType {
    USERGENERATED = 'user-generated',
    SYSTEMGENERATED = 'system-generated',
    OAUTH = 'social-oauth',
}

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
    password?: string;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    altPhone?: string;
    location?: Partial<ILocation>;
    country?: ICountry | string;
    homeCountry?: ICountry | string;
    avatar?: Upload | string;
    banner?: Upload | string;
    slug?: string;
    dateOfBirth?: Date;
    gender?: string;
    isActive?: boolean;
}

export interface UserOnboardDTO {
    step?: number;
    stage?: string;
    status?: string;
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
    onboard?: UserOnboardDTO;
}

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
    location?: ILocation;
    avatar?: Upload;
    banner?: Upload;
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
    onboard?: UserOnboardDTO;
}

export interface IBulkUser {
    email: string;
    password: string;
    passwordType: PasswordType;
    userType: UserType;
    createdBy?: string;
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
