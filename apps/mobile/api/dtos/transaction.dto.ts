/**
 * Transaction / Paystack init DTOs — aligned with `apps/api/src/dtos/transaction.dto.ts`.
 */
import { Currency } from '@/models/Subscription.model';
import {
    TransactionStatus,
    TransactionType,
} from '@/models/Transaction.model';
import type { MaskedCardDTO } from './subscription.dto';

export type { TransactionStatus, TransactionType } from '@/models/Transaction.model';

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

export interface SubscriptionPaymentDTO {
    email: string;
    amount?: number;
    planCode?: string;
    currency?: Currency;
}

/** @deprecated Prefer SubscriptionPaymentDTO; kept for parity with API export name. */
export type SubscriptionDTO = SubscriptionPaymentDTO;

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
