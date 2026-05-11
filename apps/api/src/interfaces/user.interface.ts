import { Document, Types } from 'mongoose';
import IPermissionDoc from './permission.interface';
import IRoleDoc from './role.interface';
import IListenerDoc from './listener.interface';
import IMinisterDoc from './minister.interface';
import { IAPIKey, ICountry, Upload } from './common.interface';
import { Nullable } from '@/types/common.types';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for the core user account.
 *
 * Every person on the platform has exactly one `IUserDoc`. Depending on
 * their role flags (`isListener`, `isMinister`, `isCreator`, `isAdmin`),
 * they may also have linked profile documents ({@link IListenerDoc},
 * {@link IMinisterDoc}, etc.).
 *
 * Handles authentication state (OTP, tokens, password type, 2FA),
 * onboarding progress, social login IDs, and RBAC role/permission
 * assignments.
 */
interface IUserDoc extends Document {
    /** Public user code displayed in URLs and support tickets. */
    code: string;

    /** First name. */
    firstName: string;
    /** Last name. */
    lastName: string;
    /** Middle name (optional in many cultures). */
    middleName: string;
    /** Gender identity. */
    gender: string;
    /** Date of birth. */
    dateOfBirth: Date;
    /** Primary phone number (digits only). */
    phoneNumber: string;
    /** International dialling code (e.g. `+234`). */
    phoneCode: string;
    /** Country associated with the phone number. */
    countryPhone: string;
    /** Country of residence. */
    country: ICountry;
    /** Country of origin / nationality. */
    homeCountry: ICountry;
    /** Structured physical address. */
    location: ILocation;

    /** Profile picture upload reference. */
    avatar: Upload;
    /** Banner / cover image upload reference. */
    banner: Upload;
    /** URL-safe slug derived from the user's name. */
    slug: string;
    /** Primary email address used for login and notifications. */
    email: string;

    /** Alternative phone number. */
    altPhone: string;
    /** How the user's password was originally set. */
    passwordType: PasswordType;
    /** Primary role category of the user. */
    userType: UserType;

    /** Current one-time password (hashed). */
    Otp: string;
    /** Unix timestamp when the OTP expires. */
    OtpExpiry: number;
    /** Purpose of the most recently issued OTP. */
    otpType: OtpType;
    /** Current JWT access token. */
    accessToken: string;
    /** When the current access token expires. */
    accessTokenExpiry: Date;
    /** Incremented on logout to invalidate all outstanding tokens. */
    tokenVersion: number;

    /** Login audit trail. */
    login: {
        /** ISO-8601 timestamp of the last successful login. */
        last: string;
        /** Authentication method used for the last login. */
        method: LoginMethod;
    };
    /** Onboarding progress tracker. */
    onboard: {
        /** Current step index. */
        step: number;
        /** Named stage within the onboarding flow. */
        stage: string;
        /** Overall onboarding status. */
        status: OnboardStatus;
    };
    /** Profile completion status. */
    status: {
        /** Descriptive profile status (e.g. `complete`, `incomplete`). */
        profile: string;
    };

    /** Status of a pending invitation, if the user was invited. */
    inviteStatus: string;
    /** Primary API key pair. */
    apiKey: IAPIKey;
    /** All API key pairs issued to this user. */
    keys: Array<IAPIKey>;

    /** Whether the user has super-admin privileges. */
    isSuper: boolean;
    /** Whether the user has admin privileges. */
    isAdmin: boolean;
    /** Whether the user has basic user access. */
    isUser: boolean;
    /** Whether the user has a listener profile. */
    isListener: boolean;
    /** Whether the user has a minister profile. */
    isMinister: boolean;
    /** Whether the user has a creator profile. */
    isCreator: boolean;

    /** Whether the account has been activated (e.g. email verified). */
    isActivated: boolean;
    /** Whether the account has been deactivated by the user. */
    isDeactivated: boolean;
    /** Whether an admin has suspended the account. */
    isSuspended: boolean;
    /** Computed flag: activated AND NOT deactivated/suspended. */
    isActive: boolean;
    /** Max failed login attempts before the account locks. */
    loginLimit: number;
    /** Whether the account is currently locked. */
    isLocked: boolean;
    /** When the lock expires (null if not locked). */
    lockedUntil: Nullable<Date>;
    /** Whether two-factor authentication is enabled. */
    twoFactorEnabled: boolean;

    /** Users following this account. */
    followers: Array<IUserDoc | any>;
    /** Accounts this user follows. */
    followings: Array<IUserDoc | any>;

    /** Google OAuth subject ID. */
    googleId: string;
    /** Apple Sign-In subject ID. */
    appleId: string;
    /** GitHub OAuth user ID. */
    githubId: string;

    /** RBAC roles assigned to this user. */
    roles: Array<IRoleDoc | any>;
    /** Direct permission overrides (in addition to role permissions). */
    permissions: Array<IPermissionDoc | any>;
    /** Identity verification record. */
    verification: any;
    /** Notification preferences and history. */
    notifications: Array<any>;
    /** Devices the user has logged in from. */
    devices: Array<any>;
    /** Linked listener profile, if any. */
    listener: IListenerDoc | any;
    /** Linked minister profile, if any. */
    minister: IMinisterDoc | any;

    /** The user who created this account (admin-created accounts). */
    createdBy: IUserDoc | any;

    /** Compares a plain-text password against the stored hash. */
    matchPassword: (password: string) => boolean;
    /** Generates a signed JWT access token for this user. */
    getAuthToken: () => string;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/** How the user's password was originally set. */
export enum PasswordType {
    /** User chose their own password during registration. */
    USERGENERATED = 'user-generated',
    /** System generated a temporary password (e.g. admin-created accounts). */
    SYSTEMGENERATED = 'system-generated',
    /** Password managed by an OAuth provider. */
    OAUTH = 'social-oauth',
}

/** Primary role category assigned to a user. */
export enum UserType {
    SUPERADMIN = 'super-admin',
    ADMIN = 'admin',
    MINISTER = 'minister',
    CREATOR = 'creator',
    LISTENER = 'listener',
    USER = 'user',
}

/** Purpose of a one-time password. */
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

/** Structured physical address. */
export interface ILocation {
    /** Street address. */
    address: string;
    /** City name. */
    city: string;
    /** State or province. */
    state: string;
    /** Country name. */
    country: string;
    /** Postal / ZIP code. */
    postalCode: string;
}

/** Device metadata captured at login. */
export interface IDeviceType {
    /** Device form factor. */
    type: DeviceType;
    /** Push notification token. */
    token: string;
    /** Unique device identifier. */
    deviceId: string;
    /** User-facing device name (e.g. `Damola's iPhone`). */
    deviceName: string;
    /** Device model (e.g. `iPhone 15 Pro Max`). */
    deviceModel: string;
    /** Operating system (e.g. `iOS`). */
    devicePlatform: string;
    /** OS version string. */
    deviceVersion: string;
}

/** Onboarding progress status. */
export enum OnboardStatus {
    NOT_STARTED = 'not-started',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
}

/** Status of a user invitation. */
export enum InviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}

/** Authentication method used for a login event. */
export enum LoginMethod {
    EMAIL = 'email',
    PHONE = 'phone',
    SOCIAL = 'social',
}

/** Device operating system / form factor for login tracking. */
export enum DeviceType {
    ANDROID = 'android',
    IOS = 'ios',
    MAC = 'macbook',
    WINDOWS = 'windows',
}

export default IUserDoc;
