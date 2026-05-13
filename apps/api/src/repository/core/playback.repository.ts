import { Model, Types } from 'mongoose';
import PlaybackProgress from '@/models/core/playback.model';
import { IResult } from '@/interfaces/common.interface';
import type { IPlaybackProgressDoc } from '@/interfaces/core/playback.interface';

class PlaybackRepository {
    private model: Model<IPlaybackProgressDoc>;

    constructor() {
        this.model = PlaybackProgress;
    }

    async upsertProgress(
        userId: string,
        sermonId: string,
        positionSeconds: number,
        durationSeconds?: number,
    ): Promise<IResult> {
        const $set: Record<string, number> = { positionSeconds };
        if (durationSeconds != null && !Number.isNaN(durationSeconds)) {
            $set.durationSeconds = durationSeconds;
        }

        const doc = await this.model.findOneAndUpdate(
            { user: userId, sermon: sermonId },
            {
                $set,
                $setOnInsert: {
                    user: new Types.ObjectId(userId),
                    sermon: new Types.ObjectId(sermonId),
                },
            },
            { new: true, upsert: true },
        );

        return {
            error: false,
            message: 'Progress saved',
            code: 200,
            data: doc,
        };
    }

    async listForUser(userId: string, limit = 20): Promise<IResult> {
        const rows = await this.model
            .find({ user: userId })
            .sort({ updatedAt: -1 })
            .limit(Math.min(limit, 50))
            .populate('sermon')
            .lean();

        return {
            error: false,
            message: 'Continue listening',
            code: 200,
            data: rows,
        };
    }

    async getForUserAndSermon(
        userId: string,
        sermonId: string,
    ): Promise<IResult> {
        const row = await this.model
            .findOne({ user: userId, sermon: sermonId })
            .populate('sermon')
            .lean();
        if (!row) {
            return {
                error: true,
                message: 'No progress for this sermon',
                code: 404,
                data: {},
            };
        }
        return {
            error: false,
            message: 'Progress found',
            code: 200,
            data: row,
        };
    }
}

export default new PlaybackRepository();
