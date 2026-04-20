import { Model, Types } from 'mongoose';
import PushDevice from './push-device.model';
import { IResult } from '../../../utils/interfaces.util';
import type { IPushDeviceDoc, PushDevicePlatform } from './push-device.interface';

class PushDeviceRepository {
    private model: Model<IPushDeviceDoc>;

    constructor() {
        this.model = PushDevice;
    }

    async register(
        userId: string,
        token: string,
        platform: PushDevicePlatform,
        deviceLabel?: string,
    ): Promise<IResult> {
        const doc = await this.model.findOneAndUpdate(
            { user: userId, token },
            {
                $set: {
                    platform,
                    ...(deviceLabel ? { deviceLabel } : {}),
                },
                $setOnInsert: {
                    user: new Types.ObjectId(userId),
                    token,
                },
            },
            { upsert: true, new: true },
        );

        return {
            error: false,
            code: 200,
            message: 'Device registered',
            data: doc,
        };
    }

    async remove(userId: string, token: string): Promise<IResult> {
        const res = await this.model.deleteOne({ user: userId, token });
        if (res.deletedCount === 0) {
            return {
                error: true,
                code: 404,
                message: 'Device token not found',
                data: {},
            };
        }
        return {
            error: false,
            code: 200,
            message: 'Device removed',
            data: {},
        };
    }

    async listForUser(userId: string): Promise<IResult> {
        const list = await this.model.find({ user: userId }).lean();
        return {
            error: false,
            code: 200,
            message: 'Devices',
            data: list,
        };
    }
}

export default new PushDeviceRepository();
