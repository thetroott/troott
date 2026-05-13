import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../middlewares/async.mdw';
import ErrorResponse from '../utils/error.util';
import { IUserDoc } from '@/interfaces/user.interface';
import subscriptionService from '@/services/subscription.service';
import systemService from '@/services/system.service';
import subscriptionIntentService from '@/services/subscriptionIntent.service';
import {
    CreateSubscriptionIntentDTO,
    ISubscriptionIntentDoc,
    SubscriptionIntentState,
} from '@/interfaces/subscriptionIntent.interface';

/**
 * @name newSubscription
 * @description Subscribe a user to a plan.
 * @route POST /subscriptions
 * @access Private
 */

export const newSubscription: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        const user: IUserDoc = (req as any).user;

        if (!userId) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }
        const userProfile = user;

        // validate dto from request body
        const validationResult = await subscriptionService.validateDto(
            req.body,
        );

        if (validationResult.error) {
            return next(
                new ErrorResponse(
                    validationResult.message || 'Validation Error',
                    400,
                    validationResult.data || [],
                ),
            );
        }

        const { planId, currency, interval } = req.body;
        // we need to create a key that has this three values cos if the plan is same but different interval it wouldn't proceed
        // Same plan + different interval = same key → WRONG intent reuse

        // create idempotency key
        // const idempotencyKey = `sub_${userId}_${planId}_${Date.now()}`;

        const idempotencyKey = await systemService.encryptData({
            payload: `${planId}:${currency}:${interval}`,
            password: userId,
            separator: '-',
        });

        // Idempotency first (retry collapsing)

        const subscriptionIntent =
            await subscriptionIntentService.findByKey(idempotencyKey);

        if (subscriptionIntent) {
            const result = await subscriptionService.handleSubscriptionIntent(
                subscriptionIntent,
                userProfile,
            );

            res.status(result.code).json({
                error: result.error,
                message: result.message,
                data: result.data,
            });

            return;
        }

        // User-behaviour handling (Plan switching)

        const activeIntent =
            await subscriptionIntentService.findActiveByUser(userId);

        if (activeIntent) {
            // we compare the plan

            //compare logic samePlan must compare planid, currency, interval
            if (samePlan(activeIntent, { planId, currency, interval })) {
                const result =
                    await subscriptionService.handleSubscriptionIntent(
                        activeIntent,
                        userProfile,
                    );
                res.status(result.code).json({
                    error: result.error,
                    message: result.message,
                    data: result.data,
                });

                return;
            }

            // different plan - cancel old intent

            await subscriptionIntentService.cancel(String(activeIntent._id));
        }

        // fresh intent

        const newIntent = await subscriptionIntentService.create({
            idempotencyKey,
            userId,
            planId,
            currency,
            interval,
        });

        if (!newIntent) {
            return next(
                new ErrorResponse(
                    'Failed to create subscription intent',
                    500,
                    [],
                ),
            );
        }
        const result = await subscriptionService.handleSubscriptionIntent(
            newIntent,
            userProfile,
        );

        res.status(result.code).json({
            error: result.error,
            message: result.message,
            data: result.data,
        });
        return;
    },
);

const samePlan = (
    intent: ISubscriptionIntentDoc,
    newPlan: { planId: string; currency: string; interval: string },
): boolean => {
    return (
        String(intent.planId) === String(newPlan.planId) &&
        intent.currency === newPlan.currency &&
        intent.interval === newPlan.interval
    );
};
