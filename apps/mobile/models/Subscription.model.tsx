import Plan, { IPlanTrial } from './Plan.model';
import type { IDebitCard } from './_api-types';
import type Listener from './Listener.model';
import Transaction from './Transaction.model';

export enum Currency {
    NGN = 'NGN',
    USD = 'USD',
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    PAST_DUE = 'past_due',
    TRIALING = 'trialing',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
}

export enum BillingFrequency {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
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

interface Subscription {
    code: string;
    slug: string;

    currency: Currency;
    status: SubscriptionStatus;
    billing: IBilling;
    card: IDebitCard;
    trial: IPlanTrial;

    listener: Listener | any;
    plan: Plan | any;
    transactions: Array<Transaction | any>;

    metadata: Record<string, unknown>;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export type { IDebitCard };
export default Subscription;
