import mongoose, { Schema, Model } from 'mongoose';
import { IPermissionDoc } from './permission.interface';
import { DbModels } from '../../../utils/enums.util';

const PermissionSchema = new mongoose.Schema<IPermissionDoc>(
    {
        action: {
            type: String,
            required: [true, 'Permission action is required'],
            unique: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Permission description is required'],
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret: any) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    },
);

const Permission: Model<IPermissionDoc> = mongoose.model<IPermissionDoc>(
    DbModels.PERMISSION,
    PermissionSchema,
);

export default Permission;
