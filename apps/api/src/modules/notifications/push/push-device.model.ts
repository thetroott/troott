import mongoose, { Schema, Model } from 'mongoose';
import type { IPushDeviceDoc } from './push-device.interface';
import { DbModels } from '../../../utils/enums.util';

const PUSH_PLATFORMS = ['ios', 'android', 'web', 'unknown'] as const;

const PushDeviceSchema = new Schema<IPushDeviceDoc>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
            index: true,
        },
        token: { type: String, required: true, trim: true },
        platform: {
            type: String,
            enum: PUSH_PLATFORMS,
            default: 'unknown',
        },
        deviceLabel: { type: String, trim: true, maxlength: 120 },
    },
    { timestamps: true },
);

PushDeviceSchema.index({ user: 1, token: 1 }, { unique: true });

const PushDevice: Model<IPushDeviceDoc> = mongoose.model<IPushDeviceDoc>(
    DbModels.PUSH_DEVICE,
    PushDeviceSchema,
);

export default PushDevice;
