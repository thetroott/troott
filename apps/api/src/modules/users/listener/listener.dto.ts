import { IUserDoc } from '../user/user.interface';
import { IDebitCard } from '../../shared/card.interface';

export interface CreateListenerDTO {
    user: IUserDoc;
    firstName?: string;
    lastName?: string;
    email?: string;
    gender?: string;
    avatar?: string;
    dateOfBirth?: Date;
    country?: string;
    phoneNumber?: string;
    phoneCode?: string;
    slug?: string;
    createdBy?: string;
}

export interface UpdateListenerDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    gender?: string;
    avatar?: string;
    dateOfBirth?: Date;
    country?: string;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    slug?: string;
    card?: IDebitCard;
    interests?: string[];
    badges?: string[];
}

export interface InviteListenerDTO {
    email: string;
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
