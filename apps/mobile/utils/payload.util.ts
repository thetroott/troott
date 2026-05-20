import type { UserType } from '@/models/User.model';

export interface registerUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType?: UserType;
}
export interface loginPayload {
    email: string;
    password: string;
}

export interface forgotPasswordPayload {
    email: string;
}
export interface verifyOtpPayload {
    email: string;
    OTP: number;
}
export interface activatePayload {
    email: string;
    OTP: number;
}

export interface resendOtpPayload {
    email: string;
    OTP: number;
}
export interface resetPasswordPayload {
    email: string;
    newPassword: string;
}

export interface changePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface logoutPayload {
    userId: string;
}

export interface editUserDTO {
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
