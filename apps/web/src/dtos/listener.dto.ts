import type { ICountry } from '@/utils/interfaces.util';
import type { Upload } from './common-fields';
import { UserType } from '@/models/User.model';

export interface UpdateListenerDTO {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    gender?: string;
    avatar?: string;
    banner?: Upload | string;
    dateOfBirth?: Date;
    country?: string;
    homeCountry?: ICountry | string;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    slug?: string;
    card?: Record<string, unknown>;
    onboarding?: { step?: number; status?: string };
    topics?: string[];
    ministers?: string[];
    ministry?: string;
}

export interface InviteListenerDTO {
    email: string;
    resourceId?: string;
}

export interface BulkInviteListenersDTO {
    emails: string[];
    resourceId?: string;
}

export interface AcceptListenerInvitationDTO {
    token: string;
    email: string;
    password: string;
}

export interface SetListenerPasswordDTO {
    password: string;
}

export interface ListenerResponseDTO {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    slug: string;
    gender?: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    country?: ICountry;
    homeCountry?: ICountry;
    avatar?: Upload;
    banner?: Upload;
    onboarding?: { step: number; status: string };
    topics?: string[];
    ministers?: string[];
    ministry?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ListenerProfileDTO {
    id: string;
    code: string;
    userType: UserType.LISTENER | UserType.USER;
    firstName: string;
    lastName: string;
    email: string;
    slug?: string;
    bio?: string;
    avatar?: Upload | null;
    coverImage?: Upload | null;
    topics?: string[];
    ministry?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateListenerProfileDTO {
    bio?: string;
    avatar?: Upload | null;
    coverImage?: Upload | null;
    topics?: string[];
    ministry?: string;
}

export interface OnboardTopicsDTO {
    topicIds: string[];
}

export interface OnboardMinistersDTO {
    ministerIds: string[];
}
