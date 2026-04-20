import mongoose, { Model, Schema } from 'mongoose';
import { IAPIKeyDoc } from '@/modules/shared/interfaces/interfaces.util';
import {
    APIKeyEnvironment,
    APIKeyStatus,
    APIKeyType,
    DbModels,
} from '../../../utils/enums.util';

const APIKeySchema = new Schema<IAPIKeyDoc>(
    {
        keyHash: { type: String, required: true, unique: true },
        environment: {
            type: String,
            enum: Object.values(APIKeyEnvironment),
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(APIKeyType),
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(APIKeyStatus),
            required: true,
        },
        permissions: [{ type: String }],
        expiresAt: { type: String },
        revokedAt: { type: String },
        revokedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
        description: { type: String },
        admin: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: DbModels.ADMIN,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                if ('__v' in ret) delete (ret as any).__v;
            },
        },
    },
);

APIKeySchema.index({ keyHash: 1 });
APIKeySchema.index({ userId: 1 });
APIKeySchema.index({ status: 1 });

const APIkey: Model<IAPIKeyDoc> = mongoose.model<IAPIKeyDoc>(
    DbModels.APIKEY,
    APIKeySchema,
);

export default APIkey;
