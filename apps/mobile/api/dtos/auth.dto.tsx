/**
 * Auth DTOs aligned with `apps/api/src/dtos/auth.dto.ts`.
 * Enums from `@/models/User.model` (same values as API `user.interface`).
 */
import type { OnboardStatus } from '@/models/User.model';
import { OtpType, UserType } from '@/models/User.model';

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

/** Aligned with API `resendOtpDTO` (email + purpose only). */
export interface ResendOtpDTO {
    email: string;
    otpType: OtpType;
}

export interface ResetPasswordDTO {
    email: string;
    newPassword: string;
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}

/**
 * Subset profile edit on auth routes (`apps/api/src/dtos/auth.dto.ts` `EditUserDTO`).
 * For full profile updates use `EditUserDTO` from `@/api/dtos/user.dto`.
 */
export interface AuthEditUserDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;

    country?: string;
    phoneNumber?: string;
    phoneCode?: string;

    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;
}

export interface LogoutDTO {
    userId: string;
    goTo?: (url: string) => Promise<void>;
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

export interface MapRegisteredUserDTO {
    id: string;
    code: string;
    slug: string;
    avatar?: string;

    firstName: string;
    lastName: string;
    email: string;
    userType: UserType;

    phoneNumber: string;
    phoneCode: string;
    country: string;
    dateOfBirth?: Date;
    gender: string;

    isSuper: boolean;
    isAdmin: boolean;
    isUser: boolean;
    isMinister: boolean;
    isCreator: boolean;
    isListener: boolean;

    isActive: boolean;
    isLocked: boolean;
    isActivated: boolean;
    isDeactivated: boolean;
    isSuspended: boolean;
    lockedUntil?: Date | null;

    roles: Array<string | any>;

    onboard: {
        step: number;
        stage: string;
        status: OnboardStatus | string;
    };
}

export interface MapActivatedUserDTO {
    user: MapRegisteredUserDTO;
    token: string;
}

export interface MapUserDTO {
    user: MapRegisteredUserDTO;
    token: string;
}

export interface NotificationPreferencesDTO {
    email: boolean;
    push: boolean;
    sms: boolean;
}
