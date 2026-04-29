import { BillingFrequency, Currency } from './subscription.interface';

export interface newSubscriptionDTO {
    planId: string;
    currency: Currency;
    interval: BillingFrequency;
}
