import mongoose, { Schema, Model } from 'mongoose';
import type IPlaybackSessionDoc from '@/interfaces/core/playback-session.interface';
import {
    RepeatMode,
    MediaSourceType,
    DeviceType,
    PlatformType,
    NetworkType,
    ConnectionType,
} from '@/interfaces/core/playback.interface';
import { DbModels } from '@/types/common.enum';

const PlaybackSessionSchema = new Schema<IPlaybackSessionDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },

        currentMediaItem: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SERMON,
            required: true,
            index: true,
        },

        listener: {
            type: Schema.Types.ObjectId,
            ref: DbModels.LISTENER,
            required: true,
            index: true,
        },

        sourceType: {
            type: String,
            enum: Object.values(MediaSourceType),
            required: true,
            index: true,
        },
        sourceId: { type: String, required: true },

        queueRef: { type: String },
        queueShuffled: { type: Boolean, default: false },
        queueIndex: { type: Number, default: 0 },

        isPlaying: { type: Boolean, default: false },
        isPaused: { type: Boolean, default: false },
        isBuffering: { type: Boolean, default: false },
        volume: { type: Number, default: 1 },
        muted: { type: Boolean, default: false },
        shuffle: { type: Boolean, default: false },
        playbackRate: { type: Number, default: 1 },
        repeatMode: {
            type: String,
            enum: Object.values(RepeatMode),
            default: RepeatMode.OFF,
        },

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

        startedAt: { type: String },
        lastHeartbeatAt: { type: String },
        endedAt: { type: String },
        isActive: { type: Boolean, default: true, index: true },

        syncVersion: { type: Number, default: 0 },
        updatedByDeviceId: { type: String },
        transferredFromSessionId: { type: String },
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

PlaybackSessionSchema.index({ listener: 1, isActive: 1 });
PlaybackSessionSchema.index({ listener: 1, updatedAt: -1 });

const PlaybackSession: Model<IPlaybackSessionDoc> =
    mongoose.model<IPlaybackSessionDoc>(
        DbModels.PLAYBACK_SESSION,
        PlaybackSessionSchema,
    );

export default PlaybackSession;
