import mongoose, { Schema, Model } from 'mongoose';
import type ICreatorDoc from '@/interfaces/core/creator.interface';
import { CreatorStatus, DocumentType } from '@/interfaces/core/creator.interface';
import  { VerificationStatus } from '@/interfaces/core/minister.interface';
import { DbModels } from '@/types/common.enum';
import { countrySubSchema } from '@/models/shared-schemas';

const CreatorSchema = new Schema<ICreatorDoc>(
    {
        code: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
            required: true,
        },

        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        middleName: { type: String },
        gender: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        phoneNumber: { type: String, required: true },
        phoneCode: { type: String, default: '+234', required: true },
        countryPhone: { type: String, required: true },
        country: countrySubSchema,
        homeCountry: countrySubSchema,

        avatar: { type: String, required: true },
        banner: { type: String, required: true },
        slug: { type: String, unique: true, required: true },
        email: { type: String, required: true, unique: true },

        profile: {
            displayName: { type: String, required: true },
            description: { type: String, maxLength: 500, required: true },
            username: { type: String, required: true },
            websiteUrl: { type: String, required: true },
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
            step: { type: Number, required: true },
            status: { type: String, required: true },
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
            required: true,
        },
        published: { type: Boolean, default: false, required: true },

        monthlyListeners: { type: Number, default: 0 },

        settings: { type: Schema.Types.ObjectId },
        subscription: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SUBSCRIPTION,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },

        studio: { type: Schema.Types.ObjectId, ref: DbModels.STUDIO, index: true },

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
