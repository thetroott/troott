import { Document, Types } from 'mongoose';
import { IDebitCard } from '../../shared/card.interface';
import { IMinisterDoc } from '../minister/minister.interface';
import {
    ILibraryDoc,
    ISeriesDoc,
    ISermonDoc,
    ISubscriptionDoc,
    IUserDoc,
} from '@/utils/interfaces.util';

type ObjectId = Types.ObjectId;

export interface IListenerDoc extends Document {
    code: string; // user public ID
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    slug: string;
    avatar: string;
    dateOfBirth: Date;
    gender: string;
    onboarding: {
        step: number;
        status: string;
    };
    phoneNumber: string;
    phoneCode: string;
    country: string;
    countryPhone: string;
    homeCountry: string;
    ministry: string;
    card: IDebitCard;

    topics: Array<string>;
    ministers: Array<IMinisterDoc | any>;

    likedSermons: Array<ISermonDoc | any>;
    LikedSeries: Array<ISeriesDoc | any>;
    sharedSermons: Array<ISermonDoc | any>;

    followers: Array<IUserDoc | any>;
    followings: Array<IUserDoc | any>;

    user: IUserDoc | any;
    settings: string | any;
    Library: ILibraryDoc | any;
    subscription: ISubscriptionDoc | any;
    transactions: Array<ObjectId | any>;

    createdBy: IUserDoc | any;

    // PlaybackHistory: {
    //     listener: IListenerDoc;
    //     sermon: ISermonDoc;
    //     playedAt: string;
    //     progress: number;
    //     completed: boolean;
    // };

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
