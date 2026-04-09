import { Document, Types } from 'mongoose';
import { IUserDoc } from '../user/user.interface';
import { IHackathonDoc } from '../../hackathons/hackathon/hackathon.interface';
import { IEntryDoc } from '../../hackathons/entry/entry.interface';
import { IProjectDoc } from '../../projects/project/project.interface';
import { IWorkspaceDoc } from '../../core/workspace/workspace.interface';

type ObjectId = Types.ObjectId;

// Guests are profiles that can be invited to a workspace, they only see the resource they are invited to.
// They are used to manage the lifecycle of a Guest profile
// just like a guest profie on notion
export interface IGuestDoc extends Document {
    code: string;
    firstName: string;
    lastName: string;
    slug: string;
    email: string;

    bio: string;
    jobTitle: string;
    organization: string;
    areasOfExpertise: Array<string>;
    yearsOfExperience: string;
    socials: Array<ISocials | any>;
    
    image: {
        fileName: string;
        s3Key: string;
    };

    type: GuestTypeEnum
    visibility: GuestVisibiltyEnum;
    status: GuestStatusEnum;
    inviteStatus: GuestInviteStatus;

    // Context-specific type (for mentors only)
    mentorType?: MentorContextType; // ENTRY, SUBMISSION, PROJECT, HACKATHON
    // Only relevant when type === GuestTypeEnum.MENTOR

    // ownership
    invitedBy: IUserDoc | any;
    

    settings: {
        // Additional settings can be added here
    };

    // relationships
    user: IUserDoc | any; // user this Guest profile belongs to
    hackathons: Array<IHackathonDoc | any>; // hackathons this Guest is assigned to
    entries: Array<IEntryDoc | any>; // entries this Guest was invited to (for mentors only)
    projects: Array<IProjectDoc | any>; // projects this Guest is assigned to
    workspace: Array<IWorkspaceDoc | any>; // workspaces this Guest belongs to

    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export enum GuestTypeEnum {
    MENTOR = 'mentor',
    JUDGE = 'judge',
    GUEST = 'guest'
}

export enum MentorContextType {
    ENTRY = 'entry',
    SUBMISSION = 'submission',
    PROJECT = 'project',
    HACKATHON = 'hackathon',
}


export interface ISocials {
    name: string;
    url: string;
    username: string;
}

export enum GuestVisibiltyEnum {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

export enum GuestStatusEnum {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum GuestInviteStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
}
