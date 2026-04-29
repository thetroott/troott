import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

export type PushDevicePlatform = 'ios' | 'android' | 'web' | 'unknown';

export interface IPushDeviceDoc extends Document {
    user: ObjectId;
    token: string;
    platform: PushDevicePlatform;
    deviceLabel?: string;
    createdAt: Date;
    updatedAt: Date;
    _id: ObjectId;
}
