import type { ApiUpload, IAPIKey, ICountry, IUserPermission } from './_api-types';
import Listener from './Listener.model';
import Minister from './Minister.model';

/** Physical address on the user account (`apps/api/src/interfaces/user.interface.ts`). */
export interface UserLocation {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export enum PasswordType {
    USERGENERATED = 'user-generated',
    SYSTEMGENERATED = 'system-generated',
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

export enum OnboardStatus {
    NOT_STARTED = 'not-started',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
}

export enum OnboardStage {
    TOPICS = 'topics',
    MINISTERS = 'ministers',
    SKIPPED = 'skipped',
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

export enum UserDeviceType {
    ANDROID = 'android',
    IOS = 'ios',
    MAC = 'macbook',
    WINDOWS = 'windows',
}

interface User {
    code: string;

    firstName: string;
    lastName: string;
    middleName: string;
    gender: string;
    dateOfBirth: Date;
    phoneNumber: string;
    phoneCode: string;
    countryPhone: string;
    country: ICountry;
    homeCountry: ICountry;
    location: UserLocation;

    avatar: ApiUpload | string;
    banner: ApiUpload | string;
    slug: string;
    email: string;

    altPhone: string;
    passwordType: PasswordType;
    userType: UserType;

    Otp: string;
    OtpExpiry: number;
    otpType: OtpType;
    accessToken: string;
    accessTokenExpiry: Date;
    tokenVersion: number;

    login: {
        last: string;
        method: LoginMethod;
    };
    onboard: {
        step: number;
        stage: string;
        status: OnboardStatus;
    };
    status: {
        profile: string;
    };

    inviteStatus: string;
    apiKey: IAPIKey;
    keys: Array<IAPIKey>;

    isSuper: boolean;
    isAdmin: boolean;
    isUser: boolean;
    isListener: boolean;
    isMinister: boolean;
    isCreator: boolean;
    isActivated: boolean;
    isDeactivated: boolean;
    isSuspended: boolean;
    isActive: boolean;
    loginLimit: number;
    isLocked: boolean;
    lockedUntil: Date | null;
    twoFactorEnabled: boolean;

    followers: Array<User | any>;
    followings: Array<User | any>;

    googleId: string;
    appleId: string;
    githubId: string;

    roles: Array<any>;
    permissions: Array<IUserPermission>;
    verification: any;
    notifications: Array<any>;
    devices: Array<any>;
    listener: Listener | any;
    minister: Minister | any;

    createdBy: User | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default User;
