import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

export interface IPermissionDoc extends Document {
    action: string;
    description: string;

    // timestamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
