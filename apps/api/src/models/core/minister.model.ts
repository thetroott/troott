import mongoose, { Schema, Model } from 'mongoose';
import type IMinisterDoc from '@/interfaces/core/minister.interface';
import { MinisterStatus, DocumentType } from '@/interfaces/core/minister.interface';
import { VerificationStatus } from '@/interfaces/core/minister.interface';
import { DbModels } from '@/types/common.enum';

const MinisterSchema = new Schema<IMinisterDoc>(
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
        slug: { type: String },
        email: { type: String, unique: true },

        profile: {
            description: { type: String },
            ministerialName: { type: String },
            ministryName: { type: String },
            ministryLogo: { type: String },
            ministryType: { type: String },
            ministryHQLocation: {
                city: { type: String },
                state: { type: String },
                address: { type: String },
            },
            phoneNumber: { type: String },
            phoneCode: { type: String },
            countryPhone: { type: String },
            email: { type: String },
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
                index: true,
            },
            verifiedAt: { type: Date, default: null },
            verifiedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
            isVerified: { type: Boolean, default: false },
            isPublic: { type: Boolean, default: false },
        },
        status: {
            type: String,
            enum: Object.values(MinisterStatus),
            default: MinisterStatus.ACTIVE,
        },
        published: { type: Boolean, default: false },

        monthlyListeners: { type: Number, default: 0 },

        settings: { type: Schema.Types.Mixed },
        subscription: { type: Schema.Types.ObjectId, ref: DbModels.SUBSCRIPTION },
        user: { type: Schema.Types.ObjectId, ref: DbModels.USER },

        studio: { type: Schema.Types.ObjectId, ref: DbModels.STUDIO, index: true },

        sermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
        playlists: [{ type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST }],
        transactions: [
            { type: Schema.Types.ObjectId, ref: DbModels.TRANSACTION },
        ],
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
            transform(_doc: any, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

MinisterSchema.index({
    firstName: 'text',
    lastName: 'text',
    'profile.ministerialName': 'text',
    email: 'text',
    'profile.description': 'text',
    'profile.ministryName': 'text',
});

MinisterSchema.set('toJSON', { virtuals: true, getters: true });

const Minister: Model<IMinisterDoc> = mongoose.model<IMinisterDoc>(
    DbModels.MINISTER,
    MinisterSchema,
);

export default Minister;
