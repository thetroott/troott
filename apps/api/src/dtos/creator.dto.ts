import { IUserDoc } from '@/modules/users/user/user.interface';
import { VerificationStatus } from '../utils/enums.util';

export interface CreateCreatorDTO {
    user: IUserDoc;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    phoneCode?: string;
    country?: string;
    countryPhone?: string;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;
    description?: string;
    slug?: string;
    createdBy?: string;
}

export interface UpdateCreatorDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    phoneCode?: string;
    country?: string;
    countryPhone?: string;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;
    description?: string;
    slug?: string;
}

export interface InviteCreatorDTO {
    email: string;
    resourceId?: string;
}

export interface AcceptCreatorInvitationDTO {
    token: string;
    email: string;
    password: string;
}

export interface SetCreatorPasswordDTO {
    password: string;
}

export interface SubmitCreatorVerificationDTO {
    documents: string[];
}

export interface UpdateCreatorVerificationStatusDTO {
    creatorId: string;
    status: VerificationStatus;
}
