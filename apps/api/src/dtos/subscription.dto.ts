import { BillingFrequency, Currency } from '@/modules/payments/subscription/subscription.interface';

export interface newSubscriptionDTO {
    planId: string;
    currency: Currency;
    interval: BillingFrequency;
}
