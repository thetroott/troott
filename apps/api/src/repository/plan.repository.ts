import mongoose, { Model, FilterQuery } from 'mongoose';
import Plan from '@/models/plan.model';
import { IPlanDoc, IPlanFilterOptions } from '@/interfaces/plan.interface';
import RepositoryService from '@/services/repository.service';
import { IResult } from '@/interfaces/common.interface';

/**
 * Plan Repository
 * Extends the generic repository with plan-specific methods
 * Caching is handled at the service/controller layer, not here
 */
class PlanRepository extends RepositoryService<IPlanDoc> {
    constructor() {
        super(Plan, 'Plan');
    }
    /**
     * @name addNewPlan
     * @param {Partial<IPlanDoc>} planData
     * @returns {Promise<IResult>}
     * @description Create a new plan
     */
    public async addNewPlan(planData: Partial<IPlanDoc>): Promise<IResult> {
        return this.create(planData);
    }

    /**
     * @name updatePlan
     * @param {string} planId
     * @param {Partial<IPlanDoc>} updateData
     * @returns {Promise<IResult>}
     * @description Update an existing plan by its ID
     */
    public async updatePlan(
        planId: string,
        updateData: Partial<IPlanDoc>,
    ): Promise<IResult> {
        return this.update(planId, updateData);
    }

    /**
     * @name getPlanById
     * @param {string} planId
     * @returns {Promise<IResult>}
     * @description Retrieve a plan by its ID
     */
    public async getPlanById(
        planId: string,
        populate = false,
    ): Promise<IResult> {
        return this.findById(planId, populate);
    }

    /**
     * @name findPlanByIdOrSlug
     * @param {string | number} input
     * @param {boolean} populate
     * @returns {Promise<IResult>}
     * @description Find a plan by either MongoDB ObjectId or slug
     */
    public async findPlanByIdOrSlug(
        input: string | number,
        populate = false,
    ): Promise<IResult> {
        return this.findByIdOrSlug(input, populate);
    }

    /**
     * @name findPlanByIdOrCode
     * @description Find a plan by either MongoDB ObjectId or plan code. Plan id are priotirized over plan code. and plan code is only considered when input is not a valid ObjectId
     * @param {string } input the plan id (ObjectId or string) or plan code
     * @returns {Promise<IResult>}
     *
     */
    public async findPlanByIdOrCode(input: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            // normalize input to string to satisfy Mongoose ObjectId APIs
            const inputStr = String(input);

            const isObjectId =
                mongoose.Types.ObjectId.isValid(inputStr) &&
                new mongoose.Types.ObjectId(inputStr).toString() === inputStr;

            let query = isObjectId
                ? this.model.findById(inputStr)
                : this.model.findOne({
                      code: inputStr,
                  } as FilterQuery<IPlanDoc>);

            const document = await query.lean();

            if (!document) {
                result.error = true;
                result.code = 404;
                result.message = `${this.modelName} not found`;
            } else {
                result.message = `${this.modelName} found`;
                result.data = document;
                result.filters = isObjectId
                    ? { _id: inputStr }
                    : { code: inputStr };
            }
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
        }

        return result;
    }

    /**
     * @name getPlans
     * @param {any} filterOptions
     * @param filter optional filter query
     * @returns {Promise<IResult>}
     * @description Retrieve a list of plans based on filter options
     */
    public async getPlans(
        filterOptions: IPlanFilterOptions,
        filter?: FilterQuery<IPlanDoc>,
    ): Promise<IResult> {
        return this.findAll(filter, filterOptions as any);
    }

    // [MIGRATION-REVIEW] Methods merged from flat repositories/plan.repository.ts

    public async deletePlan(id: string): Promise<IResult> {
        return this.delete(id);
    }

    public async getPlansByUser(userId: string): Promise<IResult> {
        return this.findAll({ user: userId } as any);
    }

    public async searchByName(name: string): Promise<IResult> {
        return this.findAll({ name: { $regex: name, $options: 'i' } } as any);
    }

    public async togglePlanStatus(
        id: string,
        isEnabled: boolean,
    ): Promise<IResult> {
        return this.update(id, { isEnabled } as any);
    }
}

export default new PlanRepository();
