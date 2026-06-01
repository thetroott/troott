import type { UserType } from '@/models/User.model';
import type { OtpType } from '@/api/enums';

/** @deprecated Import EditUserDTO from `@/dtos/user.dto` */
export type editUserDTO = import('./user.dto').EditUserDTO;

export interface RegisterUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType?: UserType;
}
export interface LoginDTO {
    email: string;
    password: string;
}

export interface ForgotPasswordDTO {
    email: string;
}
export interface VerifyOtpDTO {
    email: string;
    otp: number;
    otpType: OtpType;
}
export interface ActivateDTO {
    email: string;
    otp: number;
    otpType: OtpType;
}

export interface ResendOtpDTO {
    email: string;
    otpType: OtpType;
}

export interface AuthResponseDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    slug: string;
    avatar?: string;
    userType: UserType;
    isActive: boolean;
    isLocked: boolean;
    accessToken: string;
    accessTokenExpiry: Date;
}
export interface ResetPasswordDTO {
    email: string;
    newPassword: string;
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}

export interface LogoutDTO {
    userId: string;
    goTo?: (url: string) => Promise<void>;
}

/** Session user shape from login / activate / GET /auth/user. */
export interface MapRegisteredUserDTO {
    id: string;
    code: string;
    slug: string;
    avatar?: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: UserType;
    phoneNumber?: string;
    phoneCode?: string;
    country?: string;
    dateOfBirth?: Date;
    gender?: string;
    isSuper?: boolean;
    isAdmin?: boolean;
    isUser?: boolean;
    isMinister?: boolean;
    isCreator?: boolean;
    isListener?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
    lockedUntil?: Date | null;
    isActivated?: boolean;
    isDeactivated?: boolean;
    isSuspended?: boolean;
    roles?: string[];
    onboard?: {
        step: number;
        stage: string;
        status: string;
    };
    ministerCode?: string | null;
    creatorCode?: string | null;
    listenerCode?: string | null;
    adminCode?: string | null;
    studioCode?: string | null;
}
