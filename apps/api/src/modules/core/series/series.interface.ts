import { Document, Types } from 'mongoose';
import { ContentState, ContentStatus } from '../../../utils/content.enums';

type ObjectId = Types.ObjectId;

export interface ISeries {
    title: string;
    description: string;
    part: Array<string>;
    position: string;
    imageURL?: string;
    toatlDuration: string;
}

export interface ISeriesDoc extends Document {
    title: string;
    description: string;
    minister: ObjectId | any;
    sermons: Array<ObjectId | any>;
    imageUrl?: string;
    part: string;
    totalDuration: string;
    tags: Array<string>;

    isPublic: boolean;
    state: ContentState;
    status: ContentStatus;

    totalPlay: number;
    totalShares: number;
    totalLikes: number;

    versionId?: ObjectId;
    modifiedAt: Date;
    modifiedBy: ObjectId | any;
    changesSummary: string;
    deletedSeries: Array<{
        id: ObjectId;
        deletedBy: ObjectId | any;
        deletedAt: Date;
        reason?: string;
    }>;

    admin: ObjectId | any;
    createdBy: ObjectId | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
