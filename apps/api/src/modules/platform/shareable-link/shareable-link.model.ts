import mongoose, { Model, Schema } from 'mongoose';

import {
    IShareableLinkDoc,
    ShareableLinkType,
} from './shareable-link.interface';
import { DbModels } from '../../../utils/enums.util';

const ShareableLinkSchema = new Schema<IShareableLinkDoc>(
    {
        linkType: {
            type: String,
            enum: Object.values(ShareableLinkType),
            required: true,
            index: true,
        },

        resourceId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },

        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        linkName: {
            type: String,
            trim: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        isRevoked: {
            type: Boolean,
            default: false,
            index: true,
        },

        revokedAt: {
            type: Date,
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },

        accessCount: {
            type: Number,
            default: 0,
        },

        lastAccessedAt: {
            type: Date,
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

// Compound indexes for common queries
ShareableLinkSchema.index(
    {
        linkType: 1,
        resourceId: 1,
        isActive: 1,
        isRevoked: 1,
    },
    {
        partialFilterExpression: {
            isActive: true,
            isRevoked: false,
        },
    },
);

ShareableLinkSchema.index(
    {
        resourceId: 1,
        linkType: 1,
    },
);

// TTL index for automatic cleanup of expired links (optional, can be handled manually)
// ShareableLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ShareableLink: Model<IShareableLinkDoc> = mongoose.model<IShareableLinkDoc>(
    DbModels.SHAREABLE_LINK,
    ShareableLinkSchema,
);

export default ShareableLink;
