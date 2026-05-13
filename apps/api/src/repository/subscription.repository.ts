import mongoose, { FilterQuery } from 'mongoose';
import Subscription from '@/models/subscription.model';
import { ISubscriptionDoc } from '@/interfaces/subscription.interface';
import RepositoryService from '@/services/repository.service';
import { IResult } from '@/interfaces/common.interface';

/**
 * Subscription Repository
 * Extends the generic repository with subscription-specific methods
 */
class SubscriptionRepository extends RepositoryService<ISubscriptionDoc> {
    constructor() {
        super(Subscription, 'Subscription');
    }

    /**
     * Create a new subscription
     */
    public async addNewSubscription(
        subscriptionData: Partial<ISubscriptionDoc>,
    ): Promise<IResult> {
        return this.create(subscriptionData);
    }

    /**
     * Update existing subscription by id
     */
    public async updateSubscription(
        subscriptionId: string,
        updateData: Partial<ISubscriptionDoc>,
    ): Promise<IResult> {
        return this.update(subscriptionId, updateData);
    }

    /**
     * Get subscription by id
     */
    public async getSubscriptionById(
        subscriptionId: string,
        populate = false,
    ): Promise<IResult> {
        return this.findById(subscriptionId, populate);
    }

    /**
     * Find subscription by either ObjectId or code (prefers ObjectId)
     */
    public async findSubscriptionByIdOrCode(input: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const inputStr = String(input);

            const isObjectId =
                mongoose.Types.ObjectId.isValid(inputStr) &&
                new mongoose.Types.ObjectId(inputStr).toString() === inputStr;

            let query = isObjectId
                ? this.model.findById(inputStr)
                : this.model.findOne({
                      code: inputStr,
                  } as FilterQuery<ISubscriptionDoc>);

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
     * Retrieve list of subscriptions with optional filters/options
     */
    public async getSubscriptions(
        filterOptions: any,
        filter?: FilterQuery<ISubscriptionDoc>,
    ): Promise<IResult> {
        return this.findAll(filter, filterOptions);
    }

    // [MIGRATION-REVIEW] Methods merged from flat repositories/subscription.repository.ts

    public async deleteSubscription(id: string): Promise<IResult> {
        return this.delete(id);
    }

    public async getUserSubscriptions(userId: string): Promise<IResult> {
        return this.findAll({ user: userId } as any);
    }

    public async getSubscriptionsByPlan(planId: string): Promise<IResult> {
        return this.findAll({ plan: planId } as any);
    }

    public async updatePaymentStatus(
        id: string,
        isPaid: boolean,
    ): Promise<IResult> {
        return this.update(id, { isPaid } as any);
    }
}

export default new SubscriptionRepository();
