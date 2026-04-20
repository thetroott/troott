import { Document, Types } from 'mongoose';
import {
    AccountManagerRole,
    VerificationStatus,
} from '../admin/admin.enums';

type ObjectId = Types.ObjectId;

export interface IMinisterDoc extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    phoneCode: string;
    country: string;
    countryPhone: string;

    avatar: string;
    dateOfBirth: Date;
    gender: string;
    slug: string;

    description: string;
    ministry: string;
    ministryHq: string;
    ministryWebsite: string;

    sermons: Array<ObjectId | any>;
    featuredSermons: Array<ObjectId | any>;
    bites: Array<ObjectId | any>;
    topSermons: Array<ObjectId | any>;
    topBites: Array<ObjectId | any>;

    playlists: Array<ObjectId | any>;
    featuredPlaylists: Array<ObjectId | any>;

    followers: Array<ObjectId | any>;
    monthlyListeners: number;
    likes: number;
    shares: number;

    uploads: Array<ObjectId | any>;
    uploadHistory: Array<ObjectId | any>;

    identification: Array<string>;
    verificationStatus: VerificationStatus;
    isVerified: boolean;
    verifiedAt: Date;

    accountManagers: Array<{ userId: ObjectId; role: AccountManagerRole }>;

    user: ObjectId | any;
    transactions: Array<ObjectId | any>;
    createdBy: ObjectId | any;
    deletedSermons: Array<{
        id: ObjectId;
        deletedBy: ObjectId | any;
        deletedAt: Date;
        reason?: string;
    }>;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
