import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

export interface IPlaybackProgressDoc extends Document {
    user: ObjectId;
    sermon: ObjectId;
    positionSeconds: number;
    durationSeconds?: number;
    updatedAt: Date;
    createdAt: Date;
    currentTrackId?: string;

    queue: string[];
    currentIndex: number;

    isPlaying: boolean;

    shuffle: boolean;

    repeatMode: RepeatMode;

    progress: number;
    duration: number;
    _id: ObjectId;
}

export type RepeatMode = 'off' | 'all' | 'one';
