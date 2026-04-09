import mongoose, { Schema, Model } from 'mongoose';
import {
    ITalentDoc,
    GenderType,
    OccupationType,
    ITalentType,
} from './talent.interface';
import { DbModels } from '../../../utils/enums.util';

const TalentSchema = new Schema<ITalentDoc>(
    {
        code: { type: String, unique: true, index: true },
        firstName: { type: String },
        lastName: { type: String },
        slug: { type: String, lowercase: true, index: true },
        email: { type: String, required: true, lowercase: true },

        specialties: [{ type: String }],
        intrests: [{ type: String }],
        skils: [{ type: String }],
        bio: { type: String },

        gender: {
            type: String,
            enum: Object.values(GenderType),
            default: GenderType.OTHER,
        },
        dateOfBirth: { type: String }, // ISO Date string

        occupation: {
            type: String,
            enum: Object.values(OccupationType),
            default: OccupationType.PROFESSIONAL,
        },

        employment: {
            company: { type: String },
            position: { type: String },
            startDate: { type: Date },
        },

        education: {
            institution: { type: String },
            type: { type: String },
            degree: { type: String },
            fieldOfStudy: { type: String },
            startDate: { type: Date },
            endDate: { type: Date },
        },

        socials: [
            {
                name: { type: String },
                url: { type: String },
                username: { type: String },
            },
        ],

        createdBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
        settings: { type: Schema.Types.ObjectId },

        // Core Identity Relationship
        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },

        // Talent Roles (Mentor, Judge, etc.)
        roles: [
            {
                type: String,
                enum: Object.values(ITalentType),
            },
        ],

        // Ecosystem Relationships
        workspaces: [{ type: Schema.Types.ObjectId, ref: DbModels.WORKSPACE }],
        subscription: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SUBSCRIPTION,
        },
        transactions: [
            { type: Schema.Types.ObjectId, ref: DbModels.TRANSACTION },
        ],
        templates: [{ type: Schema.Types.ObjectId, ref: DbModels.TEMPLATE }],

        // Hacakthon Relationships
        hackathons: [{ type: Schema.Types.ObjectId, ref: DbModels.HACKATHON }],
        entries: [{ type: Schema.Types.ObjectId, ref: DbModels.ENTRY }],
        submissions: [
            { type: Schema.Types.ObjectId, ref: DbModels.SUBMISSION },
        ],
        squad: [{ type: Schema.Types.ObjectId, ref: DbModels.SQUAD }],

        // Project Relationships
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
                return {
                    ...ret,
                    id: ret._id.toString(),
                };
            },
        },
    },
);

const Talent: Model<ITalentDoc> = mongoose.model<ITalentDoc>(
    DbModels.TALENT,
    TalentSchema,
);

export default Talent;
