import type { BillingState } from './billing.types';

export const billingInitial: BillingState = {
    transactions: {},
    transactionIds: [],
    paymentMethods: [],
    subscriptionIntent: {
        id: null,
        expiresAt: null,
        planId: null,
        status: null,
    },
    isLoading: false,
    error: null,
};
