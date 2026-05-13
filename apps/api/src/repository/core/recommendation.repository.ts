import { Model } from 'mongoose';
import Recommendation from '@/models/core/recommendation.model';
import type { IRecommendationDoc } from '@/interfaces/core/recommendation.interface';
import { RecommendationSection } from '@/interfaces/core/recommendation.interface';
import { IResult } from '@/interfaces/common.interface';

class RecommendationRepository {
    private model: Model<IRecommendationDoc>;

    constructor() {
        this.model = Recommendation;
    }

    public async create(
        data: Partial<IRecommendationDoc>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 201,
            data: {},
        };

        const doc = await this.model.create(data);
        result.data = doc;
        result.message = 'Recommendation created';
        return result;
    }

    public async bulkUpsert(
        batch: Array<Partial<IRecommendationDoc>>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!batch.length) {
            result.data = { upserted: 0, modified: 0 };
            return result;
        }

        const ops = batch.map((item) => ({
            updateOne: {
                filter: {
                    listener: item.listener ?? null,
                    targetType: item.targetType,
                    targetId: item.targetId,
                },
                update: { $set: item },
                upsert: true,
            },
        }));

        const bulkResult = await this.model.bulkWrite(ops);
        result.data = {
            upserted: bulkResult.upsertedCount,
            modified: bulkResult.modifiedCount,
        };
        result.message = 'Bulk upsert complete';
        return result;
    }

    public async findByListener(
        listenerId: string,
        section?: RecommendationSection,
        limit = 20,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const filter: Record<string, unknown> = {
            listener: listenerId,
            isActive: true,
        };
        if (section) filter.section = section;

        const docs = await this.model
            .find(filter)
            .sort({ section: 1, score: -1 })
            .limit(limit)
            .lean();

        result.data = docs;
        return result;
    }

    public async findGlobal(
        section?: RecommendationSection,
        limit = 20,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const filter: Record<string, unknown> = {
            listener: null,
            isActive: true,
        };
        if (section) filter.section = section;

        const docs = await this.model
            .find(filter)
            .sort({ section: 1, score: -1 })
            .limit(limit)
            .lean();

        result.data = docs;
        return result;
    }

    public async findByListenerOrGlobal(
        listenerId: string,
        section?: RecommendationSection,
        limit = 20,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const filter: Record<string, unknown> = {
            $or: [{ listener: listenerId }, { listener: null }],
            isActive: true,
        };
        if (section) filter.section = section;

        const docs = await this.model
            .find(filter)
            .sort({ section: 1, score: -1 })
            .limit(limit)
            .lean();

        result.data = docs;
        return result;
    }

    public async recordFeedback(
        recoId: string,
        feedback: Partial<IRecommendationDoc['feedback']>,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const setFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(feedback)) {
            if (value !== undefined) {
                setFields[`feedback.${key}`] = value;
            }
        }

        const doc = await this.model.findByIdAndUpdate(
            recoId,
            { $set: setFields },
            { new: true },
        );

        if (!doc) {
            result.error = true;
            result.code = 404;
            result.message = 'Recommendation not found';
        } else {
            result.data = doc;
        }
        return result;
    }

    public async deactivateExpired(): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const updateResult = await this.model.updateMany(
            { expiresAt: { $lte: new Date() }, isActive: true },
            { $set: { isActive: false } },
        );

        result.data = { deactivated: updateResult.modifiedCount };
        return result;
    }

    public async deleteByVersion(version: number): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const deleteResult = await this.model.deleteMany({ version });
        result.data = { deleted: deleteResult.deletedCount };
        return result;
    }
}

export default new RecommendationRepository();
