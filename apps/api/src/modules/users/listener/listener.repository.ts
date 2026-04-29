import { FilterQuery, UpdateQuery } from 'mongoose';
import Listener from './listener.model';
import { IListenerDoc } from './listener.interface';
import RepositoryService from '../../internals/repository/repository.service';
import { IResult } from '../../../utils/interfaces.util';

/**
 * Listener repository — extends the generic repository with listener-specific methods.
 * Caching is handled at the controller layer.
 */
class ListenerRepository extends RepositoryService<IListenerDoc> {
    constructor() {
        super(Listener, 'Listener');
    }

    public async findListener(
        input: string | number,
        populate: boolean | Array<{ path: string }> = false,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    public async getListeners(
        filter?: FilterQuery<IListenerDoc>,
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

    public async createListener(
        listenerData: Partial<IListenerDoc>,
    ): Promise<IResult> {
        return this.create(listenerData);
    }

    public async updateListener(
        id: string,
        updateData: UpdateQuery<IListenerDoc> | Partial<IListenerDoc>,
    ): Promise<IResult> {
        return this.update(id, updateData);
    }

    public async deleteListener(id: string): Promise<IResult> {
        return this.delete(id);
    }
}

export default new ListenerRepository();
