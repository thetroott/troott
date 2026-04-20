import { ObjectId } from 'mongoose';
import { IUserDoc } from '../user/user.interface';
import { VerificationStatus } from '../../../utils/enums.util';
import { UserType } from '../user/user.interface';

export interface CreateMinisterDTO {
    user: IUserDoc;
    userType: UserType;
    email: string;
    createdBy?: ObjectId | any;
    slug?: string;
    description?: string;
    ministry?: string;
    ministryHq?: string;
    ministryWebsite?: string;
    identification?: string[];
    verificationStatus?: VerificationStatus;
    isVerified?: boolean;
}

export interface UpdateMinisterDTO {
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
    description?: string;
    ministry?: string;
    ministryHq?: string;
    ministryWebsite?: string;
}

export interface InviteMinisterDTO {
    email: string;
    resourceId?: string;
}

export interface AcceptMinisterInvitationDTO {
    token: string;
    email: string;
    password: string;
}

export interface SetMinisterPasswordDTO {
    password: string;
}

export interface SubmitMinisterVerificationDTO {
    documents: string[];
}

export interface UpdateMinisterVerificationStatusDTO {
    ministerId: string;
    status: VerificationStatus;
}
