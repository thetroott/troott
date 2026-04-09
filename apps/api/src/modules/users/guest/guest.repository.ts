import { FilterQuery } from 'mongoose';
import Guest from './guest.model';
import { IGuestDoc } from './guest.interface';
import RepositoryService from '../../../services/repository.service';
import { IResult } from '../../../utils/interfaces.util';

/**
 * Guest Repository
 * Extends the generic repository with guest-specific methods
 */
class GuestRepository extends RepositoryService<IGuestDoc> {
    constructor() {
        super(Guest, 'Guest');
    }

    /**
     * @name findGuest
     * @description Find a guest by either MongoDB ObjectId or slug
     * @param input - The guest ID (ObjectId or string) or slug
     * @param populate - Whether to populate related fields
     * @returns Promise<IResult>
     */
    public async findGuest(
        input: string | number,
        populate: boolean | Array<{ path: string }> = false,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    /**
     * @name getGuests
     * @param filter - Optional filter query
     * @param options - Query options (select, sort, page, limit, populate)
     * @returns {Promise<IResult>}
     * @description Get all guests with query middleware features (pagination, sorting, field selection)
     */
    public async getGuests(
        filter?: FilterQuery<IGuestDoc>,
        options?: {
            select?: string;
            sort?: string;
            page?: number;
            limit?: number;
            populate?: string | any;
        },
    ): Promise<IResult> {
        if (options) {
            return this.findAll(filter || {}, options);
        }
        return this.findAll(filter);
    }

    /**
     * @name createGuest
     * @param guestData
     * @returns {Promise<IResult>}
     * @description Create a new guest
     */
    public async createGuest(
        guestData: Partial<IGuestDoc>,
    ): Promise<IResult> {
        return this.create(guestData);
    }

    /**
     * @name updateGuest
     * @param id
     * @param updateData
     * @returns {Promise<IResult>}
     * @description Update a guest
     */
    public async updateGuest(
        id: string,
        updateData: Partial<IGuestDoc>,
    ): Promise<IResult> {
        return this.update(id, updateData);
    }

    /**
     * @name deleteGuest
     * @param id
     * @returns {Promise<IResult>}
     * @description Delete a guest
     */
    public async deleteGuest(id: string): Promise<IResult> {
        return this.delete(id);
    }
}

export default new GuestRepository();
