/**
 * Auth request/response DTOs aligned with `apps/api/src/dtos/auth.dto.ts`.
 * Enums mirror `apps/api` user interfaces via `@/models/User.model`.
 */
import type { OnboardStatus } from '@/models/User.model';
import { OtpType, UserType } from '@/models/User.model';

/**
 * Payload for `POST /auth/register` (new account before email OTP).
 */
export interface RegisterUserDTO {
    /** Given name stored on the user profile. */
    firstName: string;
    /** Family name stored on the user profile. */
    lastName: string;
    /** Account email (unique, lowercased server-side). */
    email: string;
    /** Plain password; strength rules enforced by the API. */
    password: string;
    /** Optional product role; defaults server-side when omitted. */
    userType?: UserType;
}

/**
 * Normalized success for {@link AuthService.registerUser}.
 * Troott returns the mapped user in `data` and does not issue a session token until activation/login.
 */
export interface RegisterUserResult {
    /** Mapped user row immediately after signup. */
    user: MapRegisteredUserDTO;
    /** Top-level message from the JSON envelope. */
    message: string;
}

/**
 * Payload for `POST /auth/login`.
 */
export interface LoginDTO {
    /** Account email. */
    email: string;
    /** Account password. */
    password: string;
}

/**
 * Payload for `POST /auth/forgot-password` (request reset OTP).
 */
export interface ForgotPasswordDTO {
    /** Email that will receive the OTP. */
    email: string;
}

/**
 * Payload for `POST /auth/verify-otp` (validate OTP for a given purpose).
 * Same shape is accepted by `POST /auth/activate` for activation OTP on the API.
 */
export interface VerifyOtpDTO {
    /** Email the OTP was sent to. */
    email: string;
    /** Numeric OTP as entered by the user. */
    otp: number;
    /** Purpose discriminator (register, password reset, etc.). */
    otpType: OtpType;
}

/**
 * Payload for `POST /auth/activate` (activate inactive account with OTP).
 */
export interface ActivateDTO {
    /** Account email. */
    email: string;
    /** Activation OTP. */
    otp: number;
    /** Should match the activation / register OTP flow. */
    otpType: OtpType;
}

/**
 * Payload for `POST /auth/resend-otp`.
 */
export interface ResendOtpDTO {
    /** Email to resend to. */
    email: string;
    /** Which OTP template to send. */
    otpType: OtpType;
}

/**
 * Payload for `POST /auth/reset-password` (set new password after OTP verification).
 */
export interface ResetPasswordDTO {
    /** Account email. */
    email: string;
    /** New password meeting API strength rules. */
    newPassword: string;
}

/**
 * Payload for `POST /auth/change-password` (authenticated user).
 */
export interface ChangePasswordDTO {
    /** Current password for re-auth. */
    currentPassword: string;
    /** Replacement password. */
    newPassword: string;
}

/**
 * Subset profile edit on auth routes (`apps/api` `EditUserDTO`).
 * For full profile updates prefer {@link EditUserDTO} in `user.dto`.
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

/**
 * Optional body for authenticated logout (`POST /auth/logout` with Bearer).
 */
export interface LogoutDTO {
    /** Subject user id when the server expects it explicitly. */
    userId: string;
    /** Optional client navigation hook (web legacy; unused on mobile). */
    goTo?: (url: string) => Promise<void>;
}

/**
 * Compact auth token bundle (legacy / alternate API responses).
 */
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

/**
 * Fully mapped user returned from registration / profile mappers.
 */
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

/**
 * Session payload after activation (`POST /auth/activate`).
 */
export interface MapActivatedUserDTO {
    user: MapRegisteredUserDTO;
    token: string;
}

/**
 * Session payload after login (`POST /auth/login`).
 */
export interface MapUserDTO {
    user: MapRegisteredUserDTO;
    token: string;
}

/**
 * User-level notification toggles (optional auth payloads).
 */
export interface NotificationPreferencesDTO {
    email: boolean;
    push: boolean;
    sms: boolean;
}
