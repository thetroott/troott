import mongoose, { Schema, Model } from 'mongoose';
import type IStudioDoc from '@/interfaces/core/studio.interface';
import {
    StudioRole,
    StudioStatus,
    StudioType,
} from '@/interfaces/core/studio.interface';
import { DbModels } from '@/types/common.enum';

const StudioSchema = new Schema<IStudioDoc>(
    {
        code: { type: String, required: true, unique: true, index: true },
        slug: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true, trim: true },

        country: { type: Schema.Types.Mixed, required: true },
        avatar: { type: String, default: '' },
        email: { type: String, required: true, trim: true, lowercase: true },

        profile: {
            type: {
                description: { type: String, default: '' },
                ministryName: { type: String, default: '' },
                ministryLogo: { type: String, default: '' },
                banner: { type: String, default: '' },
                ministryType: { type: String, default: '' },
                ministryHQLocation: {
                    address: { type: String, default: '' },
                    city: { type: String, default: '' },
                    state: { type: String, default: '' },
                    country: { type: String, default: '' },
                    postalCode: { type: String, default: '' },
                },
                phoneNumber: { type: String, default: '' },
                phoneCode: { type: String, default: '' },
                countryPhone: { type: String, default: '' },
                email: { type: String, default: '' },
                websiteUrl: { type: String, default: '' },
                socials: [
                    {
                        name: { type: String },
                        url: { type: String },
                        username: { type: String },
                    },
                ],
                languages: [{ type: String }],
                members: [{ type: Schema.Types.ObjectId, ref: DbModels.MINISTER }],
            },
            required: true,
        },

        parentStudio: {
            type: Schema.Types.ObjectId,
            ref: DbModels.STUDIO,
            index: true,
        },

        category: {
            type: String,
            enum: Object.values(StudioType),
            required: true,
        },
        isPublic: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },

        sermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
        series: [{ type: Schema.Types.ObjectId, ref: DbModels.SERIES }],
        playlists: [{ type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST }],

        members: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: DbModels.USER,
                    required: true,
                },
                role: {
                    type: String,
                    enum: Object.values(StudioRole),
                    required: true,
                },
                joinedAt: { type: Date, default: Date.now },
                invitedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
                permissions: [{ type: String }],
            },
        ],
        invites: [
            {
                user: { type: Schema.Types.ObjectId, ref: DbModels.USER },
                email: { type: String, trim: true, lowercase: true },
                role: {
                    type: String,
                    enum: Object.values(StudioRole),
                    required: true,
                },
                invitedBy: {
                    type: Schema.Types.ObjectId,
                    ref: DbModels.USER,
                    required: true,
                },
                invitedAt: { type: Date, default: Date.now },
                expiresAt: { type: Date },
            },
        ],

        followers: { type: Number, default: 0 },
        totalListeners: { type: Number, default: 0 },
        monthlyListeners: { type: Number, default: 0 },
        totalSermons: { type: Number, default: 0 },
        totalSeries: { type: Number, default: 0 },
        totalPlays: { type: Number, default: 0 },

        tags: [{ type: String }],
        topics: [{ type: Schema.Types.ObjectId, ref: DbModels.TOPIC }],

        status: {
            type: String,
            enum: Object.values(StudioStatus),
            default: StudioStatus.ACTIVE,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc: unknown, ret: Record<string, unknown>) {
                ret.id = ret._id;
                delete ret.__v;
                return ret;
            },
        },
    },
);

const Studio: Model<IStudioDoc> = mongoose.model<IStudioDoc>(
    DbModels.STUDIO,
    StudioSchema,
);

export default Studio;
