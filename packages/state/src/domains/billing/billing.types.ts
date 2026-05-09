export interface BillingState {
    transactions: Record<string, unknown>;
    transactionIds: string[];
    paymentMethods: unknown[];
    subscriptionIntent: {
        id: string | null;
        expiresAt: string | null;
        planId: string | null;
        status: string | null;
    };
    isLoading: boolean;
    error: string | null;
}

export type BillingAction = { type: string; payload?: unknown };
