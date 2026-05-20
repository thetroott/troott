import { FilterQuery, UpdateQuery } from 'mongoose';
import Studio from '@/models/core/studio.model';
import type IStudioDoc from '@/interfaces/core/studio.interface';
import RepositoryService from '@/services/repository.service';
import type { IResult } from '@/interfaces/common.interface';

class StudioRepository extends RepositoryService<IStudioDoc> {
    constructor() {
        super(Studio, 'Studio');
    }

    public async findStudioById(id: string, populate = false): Promise<IResult> {
        return this.findById(id, populate as any);
    }

    public async findBySlug(slug: string): Promise<IResult> {
        return this.findOne({ slug: slug.toLowerCase() } as FilterQuery<IStudioDoc>);
    }

    public async findByCode(code: string): Promise<IResult> {
        return this.findOne({
            code: code.toUpperCase(),
        } as FilterQuery<IStudioDoc>);
    }

    public async listForUser(
        userId: string,
        options?: { page?: number; limit?: number },
    ): Promise<IResult> {
        const refined: FilterQuery<IStudioDoc> = {
            $or: [{ 'members.user': userId }, { createdBy: userId }],
        } as FilterQuery<IStudioDoc>;

        return this.findAll(refined, {
            page: options?.page,
            limit: options?.limit ?? 50,
            sort: '-createdAt',
        } as any);
    }

    public async createStudio(data: Partial<IStudioDoc>): Promise<IResult> {
        return this.create(data);
    }

    public async updateStudio(
        id: string,
        data: UpdateQuery<IStudioDoc> | Partial<IStudioDoc>,
    ): Promise<IResult> {
        return this.update(id, data);
    }
}

export default new StudioRepository();
