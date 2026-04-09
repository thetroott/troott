import mongoose, { Schema, Model } from 'mongoose';
import { IGuestDoc, GuestTypeEnum, MentorContextType, GuestVisibiltyEnum, GuestStatusEnum, GuestInviteStatus } from './guest.interface';
import { DbModels } from '../../../utils/enums.util';

const GuestSchema = new Schema<IGuestDoc>(
    {
        code: { type: String, required: true, unique: true, index: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        email: { type: String, required: true, lowercase: true, index: true },

        bio: { type: String },
        jobTitle: { type: String },
        organization: { type: String },
        areasOfExpertise: { type: [String], default: [] },
        yearsOfExperience: { type: String },
        socials: [{
            name: { type: String, required: true },
            url: { type: String, required: true },
            username: { type: String },
        }],

        image: {
            fileName: { type: String },
            s3Key: { type: String },
        },

        type: {
            type: String,
            enum: Object.values(GuestTypeEnum),
            required: true,
        },
        visibility: {
            type: String,
            enum: Object.values(GuestVisibiltyEnum),
            default: GuestVisibiltyEnum.PUBLIC,
        },
        status: {
            type: String,
            enum: Object.values(GuestStatusEnum),
            default: GuestStatusEnum.ACTIVE,
        },
        inviteStatus: {
            type: String,
            enum: Object.values(GuestInviteStatus),
            default: GuestInviteStatus.PENDING,
        },

        // Context-specific type (for mentors only)
        mentorType: {
            type: String,
            enum: Object.values(MentorContextType),
        },

        // ownership (invitation-based)
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },

        settings: { type: Schema.Types.Mixed, default: {} },

        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
        },
        hackathons: [{ type: Schema.Types.ObjectId, ref: DbModels.HACKATHON }],
        entries: [{ type: Schema.Types.ObjectId, ref: DbModels.ENTRY }],
        projects: [{ type: Schema.Types.ObjectId, ref: DbModels.PROJECT }],
        workspace: [{ type: Schema.Types.ObjectId, ref: DbModels.WORKSPACE }],
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

GuestSchema.index({ areasOfExpertise: 1 });
GuestSchema.index({ type: 1 });
GuestSchema.index({ user: 1 });
GuestSchema.index({ invitedBy: 1 });

const Guest: Model<IGuestDoc> = mongoose.model<IGuestDoc>(
    DbModels.GUEST,
    GuestSchema,
);

export default Guest;
