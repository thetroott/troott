import type { ICountry } from '@/utils/interfaces.util';
import type { ILocation, Upload } from '@/dtos/common-fields';


export interface User {
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
    _version?: number;
    _id?: string;
    onboard?: { step?: number; stage?: string; status?: string };
}

export enum UserType {
    USER = 'user',
    LISTENER = 'listener',
    MINISTER = 'minister',
    CREATOR = 'creator',
    ADMIN = 'admin',
    SUPER = 'superadmin',
}

export default User;
