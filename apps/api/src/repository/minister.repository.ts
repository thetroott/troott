import { FilterQuery, UpdateQuery } from 'mongoose';
import Minister from '@/models/minister.model';
import { IMinisterDoc } from '@/modules/users/minister/minister.interface';
import RepositoryService from '@/services/repository.service';
import { IResult } from '../utils/interfaces.util';

class MinisterRepository extends RepositoryService<IMinisterDoc> {
    constructor() {
        super(Minister, 'Minister');
    }

    public async findMinister(
        input: string | number,
        populate: boolean | Array<{ path: string }> = false,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    public async getMinisters(
        filter?: FilterQuery<IMinisterDoc>,
        options?: {
            select?: string;
            sort?: string;
            page?: number;
            limit?: number;
            populate?: string | unknown;
        },
    ): Promise<IResult> {
        if (options) {
            return this.findAll(filter || {}, options as any);
        }
        return this.findAll(filter);
    }

    public async createMinister(
        ministerData: Partial<IMinisterDoc>,
    ): Promise<IResult> {
        return this.create(ministerData);
    }

    public async updateMinister(
        id: string,
        updateData: UpdateQuery<IMinisterDoc> | Partial<IMinisterDoc>,
    ): Promise<IResult> {
        return this.update(id, updateData);
    }

    public async deleteMinister(id: string): Promise<IResult> {
        return this.delete(id);
    }

    public async searchMinisters(
        q: string,
        options: { limit?: number; skip?: number } = {},
    ): Promise<IResult> {
        const trimmed = q.trim();
        if (!trimmed) {
            return {
                error: false,
                message: '',
                code: 200,
                data: [],
            };
        }
        const escapeRegex = (s: string) =>
            s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rx = new RegExp(escapeRegex(trimmed), 'i');
        const limit = Math.min(Math.max(options.limit ?? 15, 1), 40);
        const skip = Math.max(options.skip ?? 0, 0);

        const list = await Minister.find({
            $or: [
                { firstName: rx },
                { lastName: rx },
                { ministry: rx },
                { description: rx },
            ],
        })
            .skip(skip)
            .limit(limit)
            .lean();

        return {
            error: false,
            message: 'Minister search results',
            code: 200,
            data: list,
        };
    }
}

export default new MinisterRepository();
