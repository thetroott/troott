import type { IPlanTrial } from '@/dtos/api-domain';
import {
    BillingFrequency,
    Currency,
    IBilling,
    SubscriptionStatus,
} from '@/dtos/api-domain';

export interface SubscriptionCard {
    cardLast: string;
    expiryMonth: string;
    expiryYear: string;
}

export interface Subscription {
    id: string;
    code: string;
    slug: string;
    currency: Currency;
    status: SubscriptionStatus;
    billing: IBilling;
    card: SubscriptionCard;
    trial: IPlanTrial;
    planId: string;
    planName: string;
    listenerId: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    _version?: number;
    _id?: string;
}

export default Subscription;
