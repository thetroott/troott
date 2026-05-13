import { IResult } from '@/interfaces/common.interface';
import {
    CreateSubscriptionIntentDTO,
    ISubscriptionIntentDoc,
    SubscriptionIntentState,
} from '@/interfaces/subscriptionIntent.interface';
import SubscriptionIntent from '@/models/subscriptionIntent.model';

const ACTIVE_STATES = [
    SubscriptionIntentState.INITIATED,
    SubscriptionIntentState.AWAITING_PAYMENT,
    SubscriptionIntentState.PAYMENT_PROCESSING,
    SubscriptionIntentState.VALIDATING,
];

class SubscriptionIntentService {
    constructor() {}

    /**
     * @name findByKey
     * @description Find a subscription intent by its idempotency key.
     * @param idempotencyKey The idempotency key of the subscription intent.
     * @returns {Promise<ISubscriptionIntentDoc | null>} The subscription intent document or null if not found.
     */
    public async findByKey(
        idempotencyKey: string,
    ): Promise<ISubscriptionIntentDoc | null> {
        const intent = await SubscriptionIntent.findOne({ idempotencyKey });

        return intent;
    }

    /**
     * @name create
     * @description Create a new subscription intent.
     * @param intentData The data for the new subscription intent.
     * @returns {Promise<ISubscriptionIntentDoc | null>} The created subscription intent document.
     */
    public async create(
        dto: CreateSubscriptionIntentDTO,
    ): Promise<ISubscriptionIntentDoc | null> {
        const { idempotencyKey, planId, userId, currency, interval } = dto;

        try {
            const newIntent = await SubscriptionIntent.create({
                idempotencyKey,
                planId,
                userId,
                currency,
                interval,
                state: SubscriptionIntentState.INITIATED,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            });

            return newIntent;
        } catch (error: any) {
            // Duplicate idempotency key - fetch existing intent
            if (error.code === 11000) {
                const existingIntent = await SubscriptionIntent.findOne({
                    idempotencyKey: idempotencyKey,
                });

                if (!existingIntent) {
                    throw new Error(
                        'Idempotency collision but intent not found',
                    );
                }
                return existingIntent;
            }
            throw error;
        }
    }

    /**
     * @name updateState
     * @description Update the state of a subscription intent.
     * @param idempotencyKey The idempotency key of the subscription intent.
     * @param status The new status to set.
     * @returns {Promise<ISubscriptionIntentDoc | null>} The updated subscription intent document.
     *
     */

    public async updateState(
        intentId: string,
        state: SubscriptionIntentState,
    ): Promise<ISubscriptionIntentDoc | null> {
        const intent = await SubscriptionIntent.findOneAndUpdate(
            { _id: intentId, state: { $in: ACTIVE_STATES } },
            { state },
            { new: true, runValidators: true },
        );

        if (!intent) {
            throw new Error("Couldn't update state");
        }

        return intent;
    }

    /**
     * @name updateIntent
     * @description Update arbitrary fields on a subscription intent while
     * ensuring the intent is in an active state. Merges `metaData` safely
     * to avoid overwriting with `undefined`.
     */
    public async updateIntent(
        intentId: string,
        updates: Partial<ISubscriptionIntentDoc>,
    ): Promise<ISubscriptionIntentDoc | null> {
        const intent = await SubscriptionIntent.findOne({
            _id: intentId,
            state: { $in: ACTIVE_STATES },
        });

        if (!intent) {
            throw new Error("Couldn't update intent");
        }

        // Merge metaData if provided, preserving existing entries
        if (updates.metaData !== undefined) {
            intent.metaData = {
                ...(intent.metaData ?? {}),
                ...(updates.metaData as Record<string, unknown>),
            };
        }

        // Apply other updates (skip metaData which we've already handled)
        const skip = new Set([
            'metaData',
            '_id',
            'id',
            'createdAt',
            'updatedAt',
        ]);
        Object.keys(updates).forEach((key) => {
            if (skip.has(key)) return;
            // @ts-ignore - dynamic assignment
            (intent as any)[key] = (updates as any)[key];
        });

        await intent.save();

        return intent;
    }

    /**
     * @name findActiveByUser
     * @description Find subscription intent for a given user.
     * @param userId The ID of the user.
     * @returns {Promise<ISubscriptionIntentDoc | null>} A subscription intent document. There can only be one active intent per user at a time.
     */
    public async findActiveByUser(
        userId: string,
    ): Promise<ISubscriptionIntentDoc | null> {
        const intent = await SubscriptionIntent.findOne({
            userId,
            state: { $in: ACTIVE_STATES },
        }).sort({ createdAt: -1 });

        return intent;
    }

    /**
     * @name cancel
     * @description Cancels a previous user intent
     * @param intentId
     */
    public async cancel(intentId: string): Promise<void> {
        const intent = await SubscriptionIntent.findById(intentId);

        if (!intent) return;

        if (intent.state === SubscriptionIntentState.SUCCEEDED) {
            throw new Error('cannot cancel succeeded intent');
        }

        if (intent.state === SubscriptionIntentState.CANCELED) return;

        intent.state = SubscriptionIntentState.CANCELED;
        await intent.save();
    }
}

export default new SubscriptionIntentService();
