import { Document, Types } from 'mongoose';
import {
    AccountManagerRole,
    VerificationStatus,
} from '../minister/minister.interface';

type ObjectId = Types.ObjectId;

export interface ICreatorDoc extends Document {
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
    bites: Array<ObjectId | any>;
    topBites: Array<ObjectId | any>;

    followers: Array<ObjectId | any>;
    monthlyListeners: number;
    likes: number;
    shares: number;

    uploads: Array<ObjectId | any>;
    uploadHistory: Array<ObjectId | any>;

    identification: Array<string>;
    verificationStatus: VerificationStatus;
    isVerified: boolean;
    verifiedAt: Date | null;

    accountManagers: Array<{ userId: ObjectId; role: AccountManagerRole }>;

    user: ObjectId | any;
    transactions: Array<ObjectId | any>;
    createdBy: ObjectId | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
