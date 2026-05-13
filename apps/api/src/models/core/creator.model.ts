import mongoose, { Schema, Model } from 'mongoose';
import type ICreatorDoc from '@/interfaces/core/creator.interface';
import { CreatorStatus, DocumentType } from '@/interfaces/core/creator.interface';
import  { VerificationStatus } from '@/interfaces/core/minister.interface';
import { DbModels } from '@/types/common.enum';

const CreatorSchema = new Schema<ICreatorDoc>(
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

        avatar: { type: String },
        banner: { type: String },
        slug: { type: String, unique: true },
        email: { type: String, required: true, unique: true },

        profile: {
            displayName: { type: String },
            description: { type: String, maxLength: 500 },
            username: { type: String },
            websiteUrl: { type: String },
            socials: [
                {
                    name: { type: String },
                    url: { type: String },
                    username: { type: String },
                },
            ],
            languages: [{ type: String }],
        },
        onboarding: {
            step: { type: Number },
            status: { type: String },
        },

        verification: {
            document: {
                type: {
                    type: String,
                    enum: Object.values(DocumentType),
                },
                frontPage: { type: String },
                backPage: { type: String },
            },
            status: {
                type: String,
                enum: Object.values(VerificationStatus),
                default: VerificationStatus.PENDING,
            },
            verifiedAt: { type: Date, default: null },
            verifiedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
            isVerified: { type: Boolean, default: false },
            isPublic: { type: Boolean, default: false },
        },
        status: {
            type: String,
            enum: Object.values(CreatorStatus),
            default: CreatorStatus.ACTIVE,
        },
        published: { type: Boolean, default: false },

        monthlyListeners: { type: Number, default: 0 },

        settings: { type: Schema.Types.Mixed },
        subscription: { type: Schema.Types.Mixed },
        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },

        sermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
        playlists: [{ type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST }],
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

CreatorSchema.index({ user: 1 }, { unique: true });
CreatorSchema.set('toJSON', { virtuals: true, getters: true });

const Creator: Model<ICreatorDoc> = mongoose.model<ICreatorDoc>(
    DbModels.CREATOR,
    CreatorSchema,
);

export default Creator;
