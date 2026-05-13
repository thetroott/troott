import { Document, Types } from 'mongoose';
import ISubscriptionDoc, { IDebitCard } from "./subscription.interface";
import IListenerDoc from "./listener.interface";

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a financial transaction.
 *
 * Records every money movement on the platform -- subscription payments,
 * refunds, reversals, chargebacks, and adjustments. Each transaction is
 * linked to a {@link IListenerDoc listener} (as the paying party) and
 * optionally to a {@link ISubscriptionDoc subscription}.
 */
interface ITransactionDoc extends Document {
    /** Transaction category. */
    type: TransactionType;

    /** Human-readable label (e.g. `Subscription payment`). */
    label: string;
    /** Resource type this transaction relates to. */
    resource: string;
    /** Platform-generated unique reference. */
    reference: string;
    /** ISO-4217 currency code. */
    currency: string;
    /** Provider-side reference ID. */
    providerRef: string;
    /** Payment provider name (e.g. `paystack`). */
    providerName: string;
    /** Short description shown to the user. */
    description: string;
    /** Detailed narration for accounting. */
    narration: string;
    /** Transaction amount in major currency units. */
    amount: number;
    /** Amount in smallest currency unit (kobo / cents). */
    unitAmount: number;
    /** Fee charged by the platform or provider (major units). */
    fee: number;
    /** Fee in smallest currency unit. */
    unitFee: number;

    /** Processing status. */
    status: TransactionStatus;
    /** Reason for failure or reversal, if applicable. */
    reason: string;
    /** Human-readable status message. */
    message: string;
    /** Raw response payloads from the payment provider. */
    providerData: Array<Record<string, any>>;
    /** Payment channel (e.g. `card`, `bank_transfer`). */
    channel: string;
    /** URL-safe slug. */
    slug: string;
    /** Card used for this transaction. */
    card: IDebitCard;
    /** Number of times this transaction has been policed / audited. */
    policed: number;

    /** The listener who initiated or was charged for this transaction. */
    talent: IListenerDoc | any;
    /** The subscription this transaction belongs to, if any. */
    subscription: ISubscriptionDoc | any;

    /** ISO-8601 timestamp when the transaction completed. */
    completedAt: string;
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

/** Category of a financial transaction. */
export enum TransactionType {
    /** Initial charge for a service or product. */
    PAYMENT = 'PAYMENT',
    /** Full or partial refund to the listener. */
    REFUND = 'REFUND',
    /** Provider-initiated reversal. */
    REVERSAL = 'REVERSAL',
    /** Dispute raised by the card issuer. */
    CHARGEBACK = 'CHARGEBACK',
    /** Manual adjustment by an admin. */
    ADJUSTMENT = 'ADJUSTMENT',
}

/** Processing status of a transaction. */
export enum TransactionStatus {
    /** Charge initiated but not yet confirmed. */
    PENDING = 'PENDING',
    /** Payment confirmed by the provider. */
    SUCCESS = 'SUCCESS',
    /** Payment failed. */
    FAILED = 'FAILED',
    /** Transaction was cancelled before completion. */
    CANCELLED = 'CANCELLED',
}

/** Pre-defined label strings for common transaction types. */
export enum TransactionLabel {
    PRODUCT_PURCHASE = 'Product purchase',
    PRODUCT_REFUND = 'Product refund',
    SUBSCRIPTION_PAYMENT = 'Subscription payment',
    SUBSCRIPTION_REFUND = 'Subscription refund',
    CREATOR_PAYOUT = 'Creator payout',
}

export type { ITransactionDoc };
export default ITransactionDoc;
