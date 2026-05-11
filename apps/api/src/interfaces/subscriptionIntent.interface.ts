import { Document, Types } from 'mongoose';
import { BillingFrequency, Currency } from '@/interfaces/subscription.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a subscription intent (checkout flow state machine).
 *
 * An intent is created when a listener begins the subscription flow and
 * progresses through validation, payment authorisation, and subscription
 * creation. It enforces idempotency (via {@link idempotencyKey}) and
 * expiry to prevent stale intents from completing.
 */
export interface ISubscriptionIntentDoc extends Document {
    /** Client-generated idempotency key to prevent duplicate subscriptions. */
    idempotencyKey: string;

    /** The plan the listener intends to subscribe to. */
    planId: ObjectId;

    /** Billing currency. */
    currency: Currency;

    /** Billing frequency (monthly / yearly). */
    interval: BillingFrequency;

    /** The user initiating the subscription. */
    userId: ObjectId;

    /** Current state of the intent state machine. */
    state: SubscriptionIntentState;

    /** ID of the created subscription (populated on success). */
    subscriptionId: string;

    /** Payment provider reference for the associated transaction. */
    transactionReference: string;

    /** When the intent was created. */
    createdAt: Date;
    /** When the intent was last updated. */
    updatedAt: Date;
    /** Deadline after which the intent is considered expired. */
    expiresAt: Date;

    /** Provider-specific metadata. */
    metaData?: Record<string, unknown>;
}

/**
 * Payload for creating a new subscription intent.
 *
 * Passed by the client at the start of the checkout flow.
 */
export interface CreateSubscriptionIntentDTO {
    /** Client-generated idempotency key. */
    idempotencyKey: string;
    /** User ID. */
    userId: ObjectId;
    /** Plan ID. */
    planId: ObjectId;
    /** ISO-4217 currency code. */
    currency: string;
    /** Billing frequency string. */
    interval: string;
}

/**
 * State machine for subscription intent lifecycle.
 *
 * Typical happy path: INITIATED -> VALIDATING -> AWAITING_PAYMENT ->
 * PAYMENT_PROCESSING -> SUBSCRIPTION_CREATING -> SUCCEEDED.
 */
export enum SubscriptionIntentState {
    /** Intent created. */
    INITIATED = 'initiated',
    /** Validating user eligibility and plan availability. */
    VALIDATING = 'validating',
    /** Payment authorisation URL returned to the client. */
    AWAITING_PAYMENT = 'awaiting_payment',
    /** Provider is processing the payment. */
    PAYMENT_PROCESSING = 'payment_processing',
    /** Creating the subscription record. */
    SUBSCRIPTION_CREATING = 'subscription_creating',
    /** Subscription created successfully. */
    SUCCEEDED = 'succeeded',
    /** A step in the flow failed. */
    FAILED = 'failed',
    /** User or system cancelled the intent. */
    CANCELED = 'canceled',
    /** Intent timed out before completion. */
    EXPIRED = 'expired',
}
