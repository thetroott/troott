import {
    BillingFrequency,
    Currency,
    IDebitCard,
    SubscriptionStatus,
} from '@/interfaces/subscription.interface';

export interface CreateSubscriptionDTO {
    userId: string;
    planId: string;
    frequency: BillingFrequency;
    currency?: Currency;
    cardAuthCode?: string;
}

export interface RenewSubscriptionDTO {
    subscriptionId: string;
    cardAuthCode?: string;
}

export interface CancelSubscriptionDTO {
    subscriptionId: string;
    reason: string;
}

export interface ChangePlanDTO {
    subscriptionId: string;
    newPlanId: string;
    prorate?: boolean;
}

export interface UpdatePaymentMethodDTO {
    subscriptionId: string;
    card: IDebitCard;
}

export interface ProcessTransactionDTO {
    userId: string;
    amount: number;
    currency: Currency;
    cardAuthCode?: string;
    planId?: string;
}

export interface VerifyPaymentDTO {
    transactionId: string;
    reference: string;
}

export interface PauseSubscriptionDTO {
    subscriptionId: string;
    resumeAt?: Date;
}

export interface VerifyCardDTO {
    userId: string;
    card: IDebitCard;
    reference: string;
}

export interface BillingOverviewResponseDTO {
    subscriptionId: string;
    status: SubscriptionStatus;
    planName: string;
    currency: Currency;
    frequency: BillingFrequency;
    amount: number;
    nextDueAt: Date;
    isPaid: boolean;
    card?: {
        cardLast: string;
        expiryMonth: string;
        expiryYear: string;
    };
}
