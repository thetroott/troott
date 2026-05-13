import { FilterQuery, UpdateQuery } from 'mongoose';
import Creator from '@/models/core/creator.model';
import { ICreatorDoc } from '@/interfaces/core/creator.interface';
import RepositoryService from '@/services/repository.service';
import { IResult } from '@/interfaces/common.interface';

class CreatorRepository extends RepositoryService<ICreatorDoc> {
    constructor() {
        super(Creator, 'Creator');
    }

    public async findCreator(
        input: string | number,
        populate: boolean | Array<{ path: string }> = false,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    public async getCreators(
        filter?: FilterQuery<ICreatorDoc>,
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

    public async createCreator(data: Partial<ICreatorDoc>): Promise<IResult> {
        return this.create(data);
    }

    public async updateCreator(
        id: string,
        updateData: UpdateQuery<ICreatorDoc> | Partial<ICreatorDoc>,
    ): Promise<IResult> {
        return this.update(id, updateData);
    }

    public async deleteCreator(id: string): Promise<IResult> {
        return this.delete(id);
    }
}

export default new CreatorRepository();
