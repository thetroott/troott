import { Currency, TransactionStatus, TransactionType } from './api-domain';
import type { MaskedCardDTO } from './subscription.dto';

export interface NewTransactionDTO {
    userId: string;
    amount: number;
    email: string;
    currency: Currency;
}

export interface TransactionInitializationResult {
    authorizationUrl: string;
    reference: string;
    accessCode: string;
}

export interface SubscriptionDTO {
    email: string;
    amount?: number;
    planCode?: string;
    currency?: Currency;
}

export interface TransactionResponseDTO {
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
    card: MaskedCardDTO;
    completedAt: string;
    createdAt: string;
    updatedAt: string;
}
