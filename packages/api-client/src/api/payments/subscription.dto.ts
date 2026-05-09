import type PlanDTO from './plan.dto';

export interface IBilling {
    retries?: number;
    startAt?: unknown;
    paidAt?: unknown;
    dueAt?: unknown;
    graceAt?: unknown;
    amount?: number;
    frequency?: string;
    isPaid?: boolean;
}

export interface IDebitCard {
    authCode?: string;
    cardBin?: string;
    cardLast?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardPan?: string;
}

export interface SubscriptionDTO {
    code?: string;
    status?: string;
    billing?: IBilling;
    card?: IDebitCard;
    slug?: string;
    currency?: string;
    trial?: unknown;
    plan?: PlanDTO;
    createdAt?: string;
    updatedAt?: string;
    _version?: number;
    _id?: string;
    id?: string;
    [key: string]: unknown;
}

export default SubscriptionDTO;
