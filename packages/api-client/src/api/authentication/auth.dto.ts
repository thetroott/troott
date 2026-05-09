import { OtpType } from '../../utils/enums';

export interface RegisterUserDTO {
    email: string;
    password: string;
    /** Backend accepts Troott user-type strings; keep loose for app-specific enums. */
    userType?: string;
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
