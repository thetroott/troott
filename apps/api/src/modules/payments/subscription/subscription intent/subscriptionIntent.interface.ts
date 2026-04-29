import { Document, Types } from 'mongoose';
import { BillingFrequency, Currency } from '../subscription.interface';

type ObjectId = Types.ObjectId;

export interface ISubscriptionIntentDoc extends Document {
    idempotencyKey: string; // unique key for the subscription intent.

    planId: ObjectId; // the plan to subscribe to

    currency: Currency;

    interval: BillingFrequency;

    userId: ObjectId; // the user subscribing

    state: SubscriptionIntentState; // current status of the subscription intent

    subscriptionId: string; // the created subscription id (if any)

    transactionReference: string; // reference for the payment transaction (if any)

    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date; // for enforcing expiry of pending intents

    metaData?: Record<string, unknown>;
}

export interface CreateSubscriptionIntentDTO {
    idempotencyKey: string;
    userId: ObjectId;
    planId: ObjectId;
    currency: string;
    interval: string;
}

export enum SubscriptionIntentState {
    INITIATED = 'initiated', // intent created
    VALIDATING = 'validating', // user + plan validation in progress
    AWAITING_PAYMENT = 'awaiting_payment', // auth url returned to client
    PAYMENT_PROCESSING = 'payment_processing',

    SUBSCRIPTION_CREATING = 'subscription_creating',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
}
