import { Document, Types } from 'mongoose';
import IPlanDoc, { IPlanTrial } from "./plan.interface";
import IListenerDoc from "./listener.interface";
import ITransactionDoc from "./transaction.interface";

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a listener's subscription.
 *
 * Represents the ongoing billing relationship between a listener and
 * a {@link IPlanDoc plan}. Tracks billing cycle, payment card, trial
 * state, and links to all associated {@link ITransactionDoc transactions}.
 */
interface ISubscriptionDoc extends Document {
    /** Short unique code. */
    code: string;
    /** URL-safe slug. */
    slug: string;

    /** Billing currency. */
    currency: Currency;
    /** Current subscription lifecycle status. */
    status: SubscriptionStatus;
    /** Billing cycle details. */
    billing: IBilling;

    /** Payment card on file for automatic renewals. */
    card: IDebitCard;
    /** Free trial state inherited from the plan. */
    trial: IPlanTrial;

    /** The listener who holds this subscription. */
    listener: IListenerDoc | any;
    /** The plan this subscription is based on. */
    plan: IPlanDoc | any;
    /** All transactions associated with this subscription. */
    transactions: Array<ITransactionDoc | any>;

    /** Provider-specific metadata (e.g. Paystack subscription code). */
    metadata: Record<string, unknown>;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/**
 * Tokenised debit card stored on a subscription.
 *
 * @remarks This is a subscription-scoped shape that omits `token` and
 * `provider` fields. See also {@link import('./common.interface').IDebitCard}
 * for the full shape stored on the listener profile.
 */
export interface IDebitCard {
    /** Provider-issued authorisation code. */
    authCode: string;
    /** First 6 digits (BIN). */
    cardBin: string;
    /** Last 4 digits. */
    cardLast: string;
    /** Two-digit expiry month (01-12). */
    expiryMonth: string;
    /** Four-digit expiry year. */
    expiryYear: string;
    /** Masked PAN. */
    cardPan: string;
}

/** Billing cycle details for a subscription. */
export interface IBilling {
    /** Number of failed charge retries this cycle. */
    retries: number;
    /** When the current billing period started. */
    startAt: Date;
    /** When the last successful payment was made. */
    paidAt: Date;
    /** When the next payment is due. */
    dueAt: Date;
    /** End of the grace period after a missed payment. */
    graceAt: Date;
    /** Amount due in the smallest currency unit (kobo / cents). */
    amount: number;
    /** Billing frequency. */
    frequency: BillingFrequency;
    /** Whether the current period has been paid. */
    isPaid: boolean;
}

/** Subscription lifecycle status. */
export enum SubscriptionStatus {
    /** Subscription is active and in good standing. */
    ACTIVE = 'active',
    /** Listener paused the subscription. */
    PAUSED = 'paused',
    /** Payment failed; in retry / grace period. */
    PAST_DUE = 'past_due',
    /** Currently in a free trial. */
    TRIALING = 'trialing',
    /** Listener cancelled the subscription. */
    CANCELED = 'canceled',
    /** Subscription has expired (grace period ended). */
    EXPIRED = 'expired',
}

/** Supported billing currencies. */
export enum Currency {
    NGN = 'NGN',
    USD = 'USD',
}

/** Billing cycle frequency. */
export enum BillingFrequency {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export default ISubscriptionDoc;
