import { Document, Types } from 'mongoose';
import { IDebitCard } from '../../shared/interfaces/card.interface';

type ObjectId = Types.ObjectId;

export interface IListenerDoc extends Document {
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
    card?: IDebitCard;

    playlists: Array<ObjectId | any>;
    listeningHistory: Array<ObjectId | any>;
    likedSermons: Array<ObjectId | any>;
    sharedSermons: Array<ObjectId | any>;

    viewedSermonBites: Array<ObjectId | any>;
    sharedSermonBites: Array<ObjectId | any>;
    savedSermonBites: Array<ObjectId | any>;

    followers: Array<ObjectId | any>;
    following: Array<ObjectId | any>;
    interests: Array<string>;
    badges: Array<string>;

    user: ObjectId | any;
    subscriptions: Array<ObjectId | any>;
    transactions: Array<ObjectId | any>;
    createdBy: ObjectId | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
