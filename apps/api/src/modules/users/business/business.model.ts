import mongoose, { Schema, Model } from 'mongoose';
import { IBusinessDoc, VerificationType } from './business.interface';
import { DbModels } from '../../../utils/enums.util';

const BusinessSchema = new Schema<IBusinessDoc>(
    {
        code: { type: String, required: true, unique: true, index: true },

        firstName: { type: String },
        lastName: { type: String },
        slug: { type: String, required: true, unique: true, lowercase: true },
        email: { type: String, required: true, lowercase: true, index: true },

        businessName: { type: String },
        businessType: { type: String },
        description: { type: String },
        size: { type: String },
        industry: { type: String },
        tags: { type: [String], default: [] },
        website: { type: String },
        socials: [{
            name: { type: String, required: true },
            url: { type: String, required: true },
            username: { type: String },
        }],

        verification: {
            status: {
                type: String,
                enum: Object.values(VerificationType),
                default: VerificationType.UNVERIFIED,
            },
            verifiedBy: {
                type: Schema.Types.ObjectId,
                ref: DbModels.ADMIN,
            },
            verifiedAt: { type: Date },
            reason: { type: String },
        },
        registration: {
            RegisteredBusinessName: { type: String },
            registrationNumber: { type: String },
            registrationDate: { type: Date },
            registrationCountry: { type: String },
        },

        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.ADMIN,
        },

        isPublic: { type: Boolean, default: false },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },

        settings: { type: [String], default: [] },

        user: { type: Schema.Types.ObjectId, ref: DbModels.USER },

        workspaces: [{ type: Schema.Types.ObjectId, ref: DbModels.WORKSPACE }],
        subscription: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SUBSCRIPTION,
        },
        transactions: [
            { type: Schema.Types.ObjectId, ref: DbModels.TRANSACTION },
        ],

        discovery: [{ type: Schema.Types.ObjectId, ref: DbModels.DISCOVERY }],
        customDomain: [{ type: Schema.Types.ObjectId, ref: DbModels.DOMAIN }],
        templates: [{ type: Schema.Types.ObjectId, ref: DbModels.TEMPLATE }],

        hackathons: [{ type: Schema.Types.ObjectId, ref: DbModels.HACKATHON }],
        entries: [{ type: Schema.Types.ObjectId, ref: DbModels.ENTRY }],
        submissions: [
            { type: Schema.Types.ObjectId, ref: DbModels.SUBMISSION },
        ],

        projects: [{ type: Schema.Types.ObjectId, ref: DbModels.PROJECT }],
        teams: [{ type: Schema.Types.ObjectId, ref: DbModels.TEAM }],
        tasks: [{ type: Schema.Types.ObjectId, ref: DbModels.TASK }],
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

BusinessSchema.pre('save', async function (this: mongoose.Document & IBusinessDoc) {
    if (this.verification?.status === VerificationType.VERIFIED) {
        this.isPublic = true;
    } else {
        this.isPublic = false;
    }
});

BusinessSchema.index({ industry: 1 });
BusinessSchema.index({ tags: 1 });

const Business: Model<IBusinessDoc> = mongoose.model<IBusinessDoc>(
    DbModels.BUSINESS,
    BusinessSchema,
);

export default Business;
