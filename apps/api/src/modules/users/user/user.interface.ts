import { Types, Document } from 'mongoose';
import type { Nullable } from '../../shared/interfaces/nullable';
import { IAPIKey, IAPIKeyDoc } from '../../platform/apikey/apikey.interface';
import { IRoleDoc } from '../../authentication/role/role.interface';
import { IPermissionDoc } from '../../authentication/permission/permission.interface';
import { INotificationDoc } from '../../notifications/push/push.interface';

type ObjectId = Types.ObjectId;

export interface IUserDoc extends Document {
    code: string; // user public ID
    firstName: string;
    lastName: string;
    slug: string;
    email: string;
    password: string; // encrypt this data
    passwordType: PasswordType;
    userType: UserType;

    phoneCode: string;
    phoneNumber: string;

    avatar: {
        fileName: string;
        s3Key: string;
    };

    coverImage: {
        fileName: string;
        s3Key: string;
    };

    location: ILocation;
    timeZone: string;

    login: {
        last: string;
        method: LoginMethod;
    };
    onboard: {
        step: number;
        status: OnboardStatus;
    };

    inviteStatus: InviteStatus;

    apiKey: IAPIKey;
    keys: Array<IAPIKeyDoc | any>;

    Otp: string;
    OtpExpiry: number;
    otpType: OtpType;
    accessToken: string;
    accessTokenExpiry: Date;
    tokenVersion: number;

    isSuper: boolean;
    isAdmin: boolean;
    isUser: boolean;

    isActivated: boolean;
    isDeactivated: boolean;
    isSuspended: boolean;
    isActive: boolean;
    loginLimit: number;
    isLocked: boolean;
    lockedUntil: Nullable<Date>;
    twoFactorEnabled: boolean;

    /**
     * Legacy embedded listener prefs (`topics`, `minister`). Prefer
     * `userPreferences` collection via PreferenceService; new writes should not
     * rely on this field.
     */
    preferences?: Record<string, unknown>;

    /** @deprecated Use UserPreferences.notifications; may remain on old documents until lazy migration. */
    notificationPreferences?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
    };

    devices: Array<IDevice>;
    googleId: string;
    appleId: string;
    githubId: string;

    // relationships
    roles: Array<IRoleDoc | any>;
    permissions: Array<IPermissionDoc | any>;
    notifications: Array<INotificationDoc | any>;
    createdBy: ObjectId | any;

    matchPassword: (password: string) => boolean;
    getAuthToken: () => string;

    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export enum PasswordType {
    USERGENERATED = 'user-generated',
    SYSTEMGENERATED = 'system-generated',
    TEMPORARY = 'temporary',
    RESET = 'reset',
    OAUTH = 'social-oauth',
}

export enum UserType {
    SUPERADMIN = 'super-admin',
    ADMIN = 'admin',
    MINISTER = 'minister',
    CREATOR = 'creator',
    LISTENER = 'listener',
    USER = 'user',
}

export enum OtpType {
    REGISTER = 'register',
    LOGIN = 'login',
    VERIFY = 'verify',
    GENERIC = 'generic',
    PASSWORD_RESET = 'password-reset',
    ACTIVATEACCOUNT = 'activate-account',
    CHANGEPASSWORD = 'change-password',
    FORGOTPASSWORD = 'forgot-password',
}

export interface ILocation {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface IDevice {}

export enum OnboardStatus {
    NOT_STARTED = 'not-started',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
}

export enum InviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}

export enum LoginMethod {
    EMAIL = 'email',
    PHONE = 'phone',
    SOCIAL = 'social',
}

export enum DeviceType {
    ANDROID = 'android',
    IOS = 'ios',
}
