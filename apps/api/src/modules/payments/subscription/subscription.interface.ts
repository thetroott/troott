import { Document, Types } from 'mongoose';
import { IPlanDoc } from '../plan/plan.interface';
import { ITransactionDoc } from '../transaction/transaction.interface';
import type { IUserDoc } from '../../users/user/user.interface';

type ObjectId = Types.ObjectId;

export interface ISubscriptionDoc extends Document {
    // Unique subscription code for users
    code: string;

    // Subscription status/state
    status: SubscriptionStatus;

    currency: Currency;

    // Billing details for amount, due dates, retries etc
    billing: IBilling;

    // the plan associated with the subscription
    plan: IPlanDoc | any;

    // Who owns the subscription
    subscriberId: IUserDoc | ObjectId | any;
    subscriberUserType: SubscriberUserType;

    // Financial history
    transactions: Array<ITransactionDoc | ObjectId>; // last 5 transactions

    // Additional metadata for facts already proven
    metadata: Record<string, unknown>;

    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    PAST_DUE = 'past_due',
    TRIALING = 'trialing',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
}

export enum Currency {
    NGN = 'NGN',
    USD = 'USD',
}

export interface IBilling {
    retries: number;
    startAt: Date;
    paidAt: Date;
    dueAt: Date;
    graceAt: Date;
    amount: number;
    frequency: BillingFrequency;
    isPaid: boolean;
}

export enum SubscriberUserType {
    USER = 'user',
    BUSINESS = 'business',
}

export enum BillingFrequency {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}
