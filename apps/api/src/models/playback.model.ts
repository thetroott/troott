import mongoose, { Schema, Model } from 'mongoose';
import type IPlaybackDoc from '@/interfaces/playback.interface';
import {
    RepeatMode,
    NetworkType,
    ConnectionType,
    MediaSourceType,
    DeviceType,
    PlatformType,
    SkipReason,
} from '@/interfaces/playback.interface';
import { DbModels } from '@/types/common.enum';

const PlaybackSchema = new Schema<IPlaybackDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },

        session: {
            type: Schema.Types.ObjectId,
            ref: DbModels.PLAYBACK_SESSION,
        },
        listener: {
            type: Schema.Types.ObjectId,
            ref: DbModels.LISTENER,
            required: true,
            index: true,
        },
        mediaItem: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SERMON,
            required: true,
            index: true,
        },
        subscription: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SUBSCRIPTION,
        },

        sourceType: {
            type: String,
            enum: Object.values(MediaSourceType),
            index: true,
        },
        sourceId: { type: String },
        sourcePosition: { type: Number },

        playedAt: { type: String },
        startedAt: { type: String },
        endedAt: { type: String },

        volume: { type: Number },
        muted: { type: Boolean, default: false },
        shuffle: { type: Boolean, default: false },
        repeatMode: {
            type: String,
            enum: Object.values(RepeatMode),
            default: RepeatMode.OFF,
        },

        trackDurationMs: { type: Number },
        startPositionMs: { type: Number },
        endPositionMs: { type: Number },
        currentPositionMs: { type: Number },
        listenedDurationMs: { type: Number },
        foregroundDurationMs: { type: Number },
        bufferedDurationMs: { type: Number },

        completionRate: { type: Number },
        qualifiesAsStream: { type: Boolean, default: false },
        completed: { type: Boolean, default: false },
        skipped: { type: Boolean, default: false },
        skipReason: { type: String, enum: Object.values(SkipReason) },

        pausedCount: { type: Number, default: 0 },
        resumedCount: { type: Number, default: 0 },
        seekCount: { type: Number, default: 0 },
        replayCount: { type: Number, default: 0 },
        bufferCount: { type: Number, default: 0 },
        errorCount: { type: Number, default: 0 },

        sessionId: { type: String },

        deviceType: { type: String, enum: Object.values(DeviceType) },
        platform: { type: String, enum: Object.values(PlatformType) },
        deviceInfo: {
            deviceName: { type: String },
            device: { type: String },
            os: { type: String },
            browser: { type: String },
            appVersion: { type: String },
            osVersion: { type: String },
            browserVersion: { type: String },
        },

        networkType: { type: String, enum: Object.values(NetworkType) },
        connectionType: { type: String, enum: Object.values(ConnectionType) },

        offlineMode: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc: any, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

PlaybackSchema.index({ listener: 1, mediaItem: 1 });
PlaybackSchema.index({ listener: 1, updatedAt: -1 });

const Playback: Model<IPlaybackDoc> = mongoose.model<IPlaybackDoc>(
    DbModels.PLAYBACK,
    PlaybackSchema,
);

export default Playback;
