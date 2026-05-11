import mongoose, { Schema, Model } from 'mongoose';
import type IListenerDoc from '@/interfaces/listener.interface';
import { DbModels } from '@/types/common.enum';

const ListenerSchema = new Schema<IListenerDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },

        firstName: { type: String },
        lastName: { type: String },
        middleName: { type: String },
        gender: { type: String },
        dateOfBirth: { type: Date },
        phoneNumber: { type: String },
        phoneCode: { type: String, default: '+234' },
        countryPhone: { type: String },
        country: { type: Schema.Types.Mixed },
        homeCountry: { type: Schema.Types.Mixed },

        email: { type: String },
        slug: { type: String },
        avatar: {
            fileName: { type: String },
            s3Key: { type: String },
        },
        banner: {
            fileName: { type: String },
            s3Key: { type: String },
        },

        onboarding: {
            step: { type: Number },
            status: { type: String },
        },

        topics: [{ type: Schema.Types.Mixed }],
        ministers: [{ type: Schema.Types.ObjectId, ref: DbModels.MINISTER }],
        ministry: { type: String },
        card: {
            type: {
                authCode: String,
                cardBin: String,
                cardLast: String,
                expiryMonth: String,
                expiryYear: String,
                cardPan: String,
                token: String,
                provider: String,
            },
            select: false,
        },

        likedSermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
        LikedSeries: [{ type: Schema.Types.ObjectId, ref: DbModels.SERIES }],
        sharedSermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
        recentlyPlayed: [{ type: Schema.Types.Mixed }],

        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },
        settings: { type: Schema.Types.Mixed },
        Library: { type: Schema.Types.ObjectId, ref: DbModels.LIBRARY },
        playlists: [{ type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST }],
        subscription: { type: Schema.Types.ObjectId, ref: DbModels.SUBSCRIPTION },
        transactions: [
            { type: Schema.Types.ObjectId, ref: DbModels.TRANSACTION },
        ],
        createdBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
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

ListenerSchema.index({ user: 1 }, { unique: true });

const Listener: Model<IListenerDoc> = mongoose.model<IListenerDoc>(
    DbModels.LISTENER,
    ListenerSchema,
);

export default Listener;
