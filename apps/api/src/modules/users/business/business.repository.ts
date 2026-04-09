import { FilterQuery } from "mongoose";
import { UpdateQuery } from 'mongoose';
import Business from './business.model';
import { IBusinessDoc } from './business.interface';
import RepositoryService from '../../../services/repository.service';
import { IResult } from '../../../utils/interfaces.util';


/**
 * Business Repository
 * Extends the generic repository with business-specific methods
 * Caching is handled at the service/controller layer, not here
 */
class BusinessRepository extends RepositoryService<IBusinessDoc> {
    constructor() {
        super(Business, 'Business');
    }

    /**
     * @name findBusiness
     * @description Find a business by either MongoDB ObjectId or slug
     * @param input - The business ID (ObjectId or string) or slug
     * @param populate - Whether to populate related fields
     * @returns Promise<IResult>
     */
    public async findBusiness(
        input: string | number,
        populate: boolean | Array<{ path: string }> = false,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    /**
     * @name getBusinesses
     * @param filter - Optional filter query
     * @param options - Query options (select, sort, page, limit, populate)
     * @returns {Promise<IResult>}
     * @description Get all businesses with query middleware features (pagination, sorting, field selection)
     */
    public async getBusinesses(
        filter?: FilterQuery<IBusinessDoc>,
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
     * @name createBusiness
     * @param businessData
     * @returns {Promise<IResult>}
     * @description Create a new business
     */
    public async createBusiness(
        businessData: Partial<IBusinessDoc>,
    ): Promise<IResult> {
        return this.create(businessData);
    }

    /**
     * @name updateBusiness
     * @param id
     * @param updateData
     * @returns {Promise<IResult>}
     * @description Update a business
     */
    public async updateBusiness(
        id: string,
        updateData: UpdateQuery<IBusinessDoc> | Partial<IBusinessDoc>,
    ): Promise<IResult> {
        return this.update(id, updateData as any);
    }

    /**
     * @name deleteBusiness
     * @param id
     * @returns {Promise<IResult>}
     * @description Delete a business
     */
    public async deleteBusiness(id: string): Promise<IResult> {
        return this.delete(id);
    }
}

export default new BusinessRepository();
