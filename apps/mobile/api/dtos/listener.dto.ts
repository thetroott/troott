/**
 * Listener DTOs aligned with `apps/api/src/dtos/core/listener.dto.ts`.
 */
import type { ApiUpload, ICountry, IDebitCard } from '@/models/_api-types';
import { UserType } from '@/models/User.model';

export interface UpdateListenerDTO {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    gender?: string;
    avatar?: string;
    banner?: ApiUpload | string;
    dateOfBirth?: Date;
    country?: string;
    homeCountry?: ICountry | string;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    slug?: string;
    card?: IDebitCard;
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
    avatar?: ApiUpload;
    banner?: ApiUpload;
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
    avatar?: ApiUpload | null;
    coverImage?: ApiUpload | null;
    topics?: string[];
    ministry?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateListenerProfileDTO {
    bio?: string;
    avatar?: ApiUpload | null;
    coverImage?: ApiUpload | null;
    topics?: string[];
    ministry?: string;
}

export interface OnboardTopicsDTO {
    topicIds: string[];
}

export interface OnboardMinistersDTO {
    ministerIds: string[];
}
