import mongoose, { Schema, Model } from 'mongoose';
import type { IPlaybackProgressDoc } from './playback.interface';
import { DbModels } from '../../../utils/enums.util';

const PlaybackProgressSchema = new Schema<IPlaybackProgressDoc>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
            index: true,
        },
        sermon: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SERMON,
            required: true,
            index: true,
        },
        positionSeconds: { type: Number, required: true, min: 0 },
        durationSeconds: { type: Number, min: 0 },
    },
    { timestamps: true },
);

PlaybackProgressSchema.index({ user: 1, sermon: 1 }, { unique: true });
PlaybackProgressSchema.index({ user: 1, updatedAt: -1 });

const PlaybackProgress: Model<IPlaybackProgressDoc> =
    mongoose.model<IPlaybackProgressDoc>(
        DbModels.PLAYBACK_PROGRESS,
        PlaybackProgressSchema,
    );

export default PlaybackProgress;
