import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

export interface IAPIKeyDoc extends Document {
    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export interface IAPIKey {
    name: string;
    key: string;
    keyHint: string;
    description: string;
    createdAt: Date;
    lastUsed: Date;
}
