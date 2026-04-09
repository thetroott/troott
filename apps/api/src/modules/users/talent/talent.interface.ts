import { Document, Types } from 'mongoose';
import { IUserDoc } from '../user/user.interface';
import { IWorkspaceDoc } from '../../core/workspace/workspace.interface';
import { ISubscriptionDoc } from '../../payments/subscription/subscription.interface';
import { ITransactionDoc } from '../../payments/transaction/transaction.interface';
import { IHackathonDoc } from '../../hackathons/hackathon/hackathon.interface';
import { IEntryDoc } from '../../hackathons/entry/entry.interface';
import { ISubmissionDoc } from '../../hackathons/submission/submission.interface';
import { ISquadDoc } from '../../hackathons/squad/squad.interface';
import { IProjectDoc } from '../../projects/project/project.interface';
import { ITeamDoc } from '../../projects/team/team.interface';
import { ITaskDoc } from '../../projects/task/task.interface';
import { ITemplateDoc } from '../../core/template/interface.template';

type ObjectId = Types.ObjectId;

export interface ITalentDoc extends Document {
    code: string;
    firstName: string;
    lastName: string;
    slug: string;
    email: string;

    specialties: Array<string>; // what kind of work do you do?
    intrests: Array<string>;
    skils: Array<string>; // skills you have
    bio: string;

    gender: GenderType;
    dateOfBirth: string; // ISO Date

    occupation: OccupationType;

    employment: {
        company: string;
        position: string;
        startDate: Date;
    };

    education: {
        institution: string;
        type: string;
        degree: string;
        fieldOfStudy: string;
        startDate: Date;
        endDate: Date;
    };

    socials: Array<ISocials | any>;

    createdBy: ObjectId | any;
    settings: ObjectId | any;

    // relationships
    user: IUserDoc | any;
    roles: Array<ITalentType | any>;

    workspaces: Array<IWorkspaceDoc | any>;
    subscription: ISubscriptionDoc | any;
    trial: { hasUsedTrial: boolean; planCode: string; usedAt: Date };
    transactions: Array<ITransactionDoc | any>;
    templates: Array<ITemplateDoc | any>;

    hackathons: Array<IHackathonDoc | any>;
    entries: Array<IEntryDoc | any>;
    submissions: Array<ISubmissionDoc | any>;
    squad: Array<ISquadDoc | any>;

    projects: Array<IProjectDoc | any>;
    teams: Array<ITeamDoc | any>;
    tasks: Array<ITaskDoc | any>;

    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export interface ISocials {
    name: string;
    url: string;
    username: string;
}

export enum GenderType {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum OccupationType {
    STUDENT = 'student',
    PROFESSIONAL = 'professional',
    ENTREPRENEUR = 'entrepreneur',
    FREELANCER = 'freelancer',
    OTHER = 'other',
}

export enum ITalentType {
    MENTOR = 'mentor',
    JUDGE = 'judge',
}
