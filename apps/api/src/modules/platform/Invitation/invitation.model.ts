import mongoose, { Model, Schema } from 'mongoose';

import {
    IInvitationDoc,
    InvitationStatus,
    InvitationType,
} from './invitation.interface';
import { DbModels } from '../../../utils/enums.util';

const InvitationSchema = new Schema<IInvitationDoc>(
    {
        inviteType: {
            type: String,
            enum: Object.values(InvitationType),
            required: true,
        },

        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },

        inviteeEmail: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        inviteeUserId: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
        },

        inviteToken: {
            type: String,
            default: null,
            index: true,
        },

        inviteStatus: {
            type: String,
            enum: Object.values(InvitationStatus),
            default: InvitationStatus.PENDING,
            index: true,
        },

        invitedAt: {
            type: Date,
            default: Date.now,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // TTL
        },

        acceptedAt: {
            type: Date,
        },

        revokedAt: {
            type: Date,
        },

        declinedAt: {
            type: Date,
        },

        resourceId: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
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

InvitationSchema.index(
    {
        inviteeEmail: 1,
        inviteType: 1,
        inviteStatus: 1,
    },
    {
        partialFilterExpression: {
            inviteStatus: InvitationStatus.PENDING,
        },
    },
);

const Invites: Model<IInvitationDoc> = mongoose.model<IInvitationDoc>(
    DbModels.INVITES,
    InvitationSchema,
);

export default Invites;
