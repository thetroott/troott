import type Subscription from './Subscription.model';
import type Listener from './Listener.model';
import type { IDebitCard } from './_api-types';

export enum TransactionType {
    PAYMENT = 'PAYMENT',
    REFUND = 'REFUND',
    REVERSAL = 'REVERSAL',
    CHARGEBACK = 'CHARGEBACK',
    ADJUSTMENT = 'ADJUSTMENT',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

export enum TransactionLabel {
    PRODUCT_PURCHASE = 'Product purchase',
    PRODUCT_REFUND = 'Product refund',
    SUBSCRIPTION_PAYMENT = 'Subscription payment',
    SUBSCRIPTION_REFUND = 'Subscription refund',
    CREATOR_PAYOUT = 'Creator payout',
}

interface Transaction {
    type: TransactionType;
    label: string;
    resource: string;
    reference: string;
    currency: string;
    providerRef: string;
    providerName: string;
    description: string;
    narration: string;
    amount: number;
    unitAmount: number;
    fee: number;
    unitFee: number;

    status: TransactionStatus;
    reason: string;
    message: string;
    providerData: Array<Record<string, any>>;
    channel: string;
    slug: string;
    card: IDebitCard;
    policed: number;

    listener: Listener | any;
    subscription: Subscription | any;

    completedAt: string;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default Transaction;
