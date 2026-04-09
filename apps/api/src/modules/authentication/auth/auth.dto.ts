import { Types } from 'mongoose';
import {
    IUserDoc,
    OnboardStatus,
    OtpType,
    UserType,
} from '../../users/user/user.interface';
import { GenderType } from '../../users/talent/talent.interface';
import { BusinessType } from '../../users/business/business.interface';

export type ObjectId = Types.ObjectId;

export interface RegisterUserDTO {
    email: string;
    password: string;
    userType: UserType;
}
export interface LoginDTO {
    email: string;
    password: string;
}

export interface ActivateDTO {
    email: string;
    otp: number;
    otpType: OtpType;
}

export interface OnboardDTO {}

// Onboarding DTOs matching the new user interface
export interface OnboardUserTypeDTO {
    userType: UserType;
}

export interface OnboardBasicInfoDTO {
    firstName: string;
    lastName: string;
    phoneCode?: string;
    phoneNumber?: string;
    location: {
        address?: string;
        city?: string;
        state?: string;
        country: string; // Required
        postalCode?: string;
    };
    timeZone: string; // IANA timezone string
}

export interface OnboardTalentInfoDTO {
    specialty: string; // What kind of work do you do?
    gender: GenderType; // MALE, FEMALE, OTHER
    dateOfBirth: string; // ISO Date format (e.g., "1990-05-15")
}

export interface OnboardBusinessInfoDTO {
    businessName: string;
    businessType: BusinessType; // COMPANY, NONPROFIT, GOVERNMENT, EDUCATION, PARTNER, OTHER
    industry: string;
    tags?: Array<string>; // Optional array of tags
}

export interface OnboardUserInfoDTO {
    specialty: string; // What kind of work do you do?
    role: string; // What is your role?
    discovery: string; // How did you discover Pacepard?
}

export interface OnboardStatusResponse {
    step: number; // Current step (1-4)
    status: OnboardStatus; // NOT_STARTED, IN_PROGRESS, COMPLETED
    progress: {
        completedSteps: number;
        totalSteps: number;
        percentage: number;
    };
    canProceed: boolean; // Whether user can proceed to next step
    currentStepData?: any; // Data for current step if applicable
}

export interface ForgotPasswordDTO {
    email: string;
}
export interface VerifyOtpDTO {
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

export interface AcceptInvitationDTO {
    token: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface RevokeInvitationDTO {
    token: string;
    email: string;
}

export interface InviteTalentDTO {
    email: string;
    resourceId?: string;
}

export interface InviteBusinessDTO {
    email: string;
    resourceId?: string;
}

export interface EditUserDTO {
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

export interface MatchEncryptedPasswordDTO {
    user: IUserDoc;
    hash: string;
}

export interface MapRegisteredUserDTO {
    id: ObjectId | string;

    firstName: string;
    lastName: string;
    email: string;

    phoneNumber: string;
    phoneCode: string;
    country: string;
    dateOfBirth: Date;
    gender: string;

    avatar?: string;
    userType: UserType;
    passwordType: string;

    isSuper: boolean;
    isAdmin: boolean;
    isOrganisation: boolean;
    isTalent: boolean;

    isActive: boolean;
    isLocked: boolean;
    lockedUntil?: Date | null;

    roles: Array<ObjectId | any>;
}

export interface MapActivatedUserDTO {
    id: ObjectId | string;

    firstName: string;
    lastName: string;
    email: string;

    phoneNumber: string;
    country: string;
    dateOfBirth: Date;
    gender: string;

    avatar?: string;
    userType: UserType;

    //onboarding
    onboard: {
        step: number;
        status: string;
    };
    status: {
        profile: string;
    };
    inviteStatus: string;

    isSuper: boolean;
    isAdmin: boolean;
    isOrganisation: boolean;
    isTalent: boolean;

    isActive: boolean;
    isLocked: boolean;
    lockedUntil?: Date | null;

    roles: Array<ObjectId | any>;
}
