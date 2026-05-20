import { TransactionStatus, TransactionType } from '@/dtos/api-domain';

export interface TransactionCard {
    cardLast: string;
    expiryMonth: string;
    expiryYear: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    label: string;
    reference: string;
    currency: string;
    providerRef: string;
    providerName: string;
    description: string;
    amount: number;
    unitAmount: number;
    fee: number;
    unitFee: number;
    status: TransactionStatus;
    reason: string;
    message: string;
    channel: string;
    slug: string;
    card: TransactionCard;
    completedAt: string;
    createdAt: string;
    updatedAt: string;
    talent?: unknown;
    subscription?: unknown;
    resource?: string;
    narration?: string;
    providerData?: unknown[];
    metadata?: unknown[];
    policed?: number;
    _version?: number;
    _id?: string;
}

export default Transaction;
