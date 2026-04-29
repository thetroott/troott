import { faker } from '@faker-js/faker';
import {
    ISubscriptionDoc,
    SubscriptionStatus,
    Currency,
    BillingFrequency,
    SubscriberUserType,
} from '../../src/modules/subscription/subscription.interface';
import Subscription from '../../src/modules/subscription/subscription.model';
import { IBusinessDoc } from '../../src/modules/business/business.interface';
import { ITalentDoc } from '../../src/modules/talents/talent.interface';
import { IPlanDoc } from '../../src/modules/plan/plan.interface';
import { Random } from '@btffamily/pacitude';

/**
 * Factory for creating test subscription data
 */

export interface SubscriptionFactoryOptions {
    status?: SubscriptionStatus;
    currency?: Currency;
    billingFrequency?: BillingFrequency;
    amount?: number;
    plan?: IPlanDoc | string;
    subscriberId?: IBusinessDoc | ITalentDoc | string;
    subscriberUserType?: SubscriberUserType;
    isPaid?: boolean;
    startAt?: Date;
    dueAt?: Date;
}

/**
 * Generates a subscription code
 */
const genSubscriptionCode = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const code = Random.randomNum(6);
    return `sub-${year}-${code}`;
};

/**
 * Creates a subscription factory data object
 */
export const createSubscriptionData = (
    options: SubscriptionFactoryOptions = {},
): Partial<ISubscriptionDoc> => {
    const {
        status = SubscriptionStatus.ACTIVE,
        currency = Currency.NGN,
        billingFrequency = BillingFrequency.MONTHLY,
        amount,
        plan,
        subscriberId,
        subscriberUserType,
        isPaid = false,
        startAt,
        dueAt,
    } = options;

    const planId = typeof plan === 'string' ? plan : plan?._id || plan?.id;
    const subscriberIdValue =
        typeof subscriberId === 'string'
            ? subscriberId
            : subscriberId?._id || subscriberId?.id;

    if (!planId) {
        throw new Error('Plan is required for subscription creation');
    }
    if (!subscriberIdValue) {
        throw new Error('Subscriber ID is required for subscription creation');
    }

    // Determine subscriber type if not provided
    let finalSubscriberType = subscriberUserType;
    if (!finalSubscriberType) {
        // Default to BUSINESS if not specified
        finalSubscriberType = SubscriberUserType.BUSINESS;
    }

    const now = new Date();
    const defaultAmount = amount || (currency === Currency.NGN ? 10000 : 10);
    const defaultStartAt = startAt || now;
    const defaultDueAt =
        dueAt ||
        new Date(
            defaultStartAt.getTime() +
                (billingFrequency === BillingFrequency.MONTHLY
                    ? 30 * 24 * 60 * 60 * 1000
                    : 365 * 24 * 60 * 60 * 1000),
        );

    return {
        code: genSubscriptionCode(),
        status,
        currency,
        billing: {
            retries: 0,
            startAt: defaultStartAt,
            paidAt: isPaid ? defaultStartAt : new Date(),
            dueAt: defaultDueAt,
            graceAt: new Date(defaultDueAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days grace period
            amount: defaultAmount,
            frequency: billingFrequency,
            isPaid,
        },
        plan: planId,
        subscriberId: subscriberIdValue,
        subscriberUserType: finalSubscriberType,
        transactions: [],
        metadata: {},
    };
};

/**
 * Creates and saves a test subscription
 */
export const createSubscription = async (
    options: SubscriptionFactoryOptions = {},
): Promise<ISubscriptionDoc> => {
    const subscriptionData = createSubscriptionData(options);
    const subscription = await Subscription.create(subscriptionData);
    return subscription;
};

/**
 * Creates multiple test subscriptions
 */
export const createSubscriptions = async (
    count: number,
    options: SubscriptionFactoryOptions = {},
): Promise<ISubscriptionDoc[]> => {
    const subscriptions: ISubscriptionDoc[] = [];
    for (let i = 0; i < count; i++) {
        subscriptions.push(await createSubscription(options));
    }
    return subscriptions;
};
