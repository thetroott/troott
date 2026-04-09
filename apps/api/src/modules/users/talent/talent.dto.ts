import { IUserDoc } from '../user/user.interface';
import {
    GenderType,
    OccupationType,
    ITalentType,
    ISocials,
} from './talent.interface';

export interface CreateTalentDTO {
    code: string; //map the code from user
    firstName: string;
    lastName: string;
    email: string;
    user: IUserDoc; // The ObjectId of the associated User accoun
    createdBy: string; // ObjectId of the creator/admin
}

//use omit form type
export interface UpdateTalentDTO {
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    user: IUserDoc; // The ObjectId of the associated User account

    // Profile Details
    bio?: string;
    gender?: GenderType;
    dateOfBirth?: string;
    occupation?: OccupationType;

    // Arrays of data
    specialties?: string[];
    intrests?: string[];
    skils?: string[];
    socials?: ISocials[];

    // Professional & Academic
    employment?: {
        company: string;
        position: string;
        startDate: Date;
    };

    education?: {
        institution: string;
        type: string;
        degree: string;
        fieldOfStudy: string;
        startDate: Date;
        endDate: Date;
    };

    // Initial Roles
    roles?: ITalentType[];

    // Tracking
    createdBy?: string; // ObjectId of the creator/admin
}

export interface InviteTalentDTO {
    email: string;
    resourceId?: string;
}

export interface AcceptTalentInvitationDTO {
    token: string;
    email: string;
    password: string;
}

export interface SetTalentPasswordDTO {
    password: string;
}
