import type SubscriptionDTO from './subscription.dto';

export interface TransactionDTO {
    code?: string;
    type?: string;
    label?: string;
    resource?: string;
    reference?: string;
    currency?: string;
    amount?: number;
    status?: string;
    subscription?: SubscriptionDTO;
    createdAt?: string;
    updatedAt?: string;
    _id?: string;
    id?: string;
    [key: string]: unknown;
}

export default TransactionDTO;
