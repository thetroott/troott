import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

export interface IPlaybackProgressDoc extends Document {
    user: ObjectId;
    sermon: ObjectId;
    positionSeconds: number;
    durationSeconds?: number;
    updatedAt: Date;
    createdAt: Date;
    _id: ObjectId;
}
