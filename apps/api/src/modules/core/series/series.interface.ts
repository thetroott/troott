import { Document, Types } from 'mongoose';
import { ContentStatus } from '../../../utils/content.enums';
import { IMinisterDoc } from '@/utils/interfaces.util';
import { ImageSource } from '../sermon/sermon.interface';

type ObjectId = Types.ObjectId;

export interface ISeriesDoc extends Document {
    title: string;
    description: string;
    ministers: Array<IMinisterDoc | any>; // list of minister(s)
    sermons: Array<ObjectId | any>;
    image: ImageSource | any;
    totalDuration: number; // total duration of all the sermons in the series
    numberOfSermons: number; // number of sermons in the series
    topic: string; // series topic or category
    tags: Array<string>;

    status: ContentStatus; // draft or published
    isPublic: boolean;
    shareableUrl: string; // shareable URL for the series; // list of minister(s)

    totalPlay: number;
    totalShares: number;
    totalLikes: number;

    ownerId: IMinisterDoc | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
