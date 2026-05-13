import {
    BillingFrequency,
    Currency,
    IBilling,
    IDebitCard,
    SubscriptionStatus,
} from '@/interfaces/subscription.interface';
import { IPlanTrial } from '@/interfaces/plan.interface';

export interface CreateSubscriptionDTO {
    planId: string;
    currency: Currency;
    interval: BillingFrequency;
}

export interface UpdateSubscriptionDTO {
    status?: SubscriptionStatus;
    card?: IDebitCard;
    billing?: Partial<IBilling>;
}

export interface MaskedCardDTO {
    cardLast: string;
    expiryMonth: string;
    expiryYear: string;
}

export interface SubscriptionResponseDTO {
    id: string;
    code: string;
    slug: string;
    currency: Currency;
    status: SubscriptionStatus;
    billing: IBilling;
    card: MaskedCardDTO;
    trial: IPlanTrial;
    planId: string;
    planName: string;
    listenerId: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
