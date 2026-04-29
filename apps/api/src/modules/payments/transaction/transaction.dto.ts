import { Currency } from '../subscription/subscription.interface';

/**
 * Payload used to initialize a Paystack transaction.
 */
export interface NewTransactionDTO {
    userId: string;

    /**
     * Amount in the lowest currency unit.
     * Example:
     * - NGN → kobo
     * - USD → cents
     */
    amount: number;

    /**
     * Customer email required by Paystack.
     */
    email: string;

    /**
     * Transaction currency.
     */
    currency: Currency;
}

/**
 * Result returned after initializing a Paystack transaction.
 *
 * NOTE:
 * This does NOT mean payment success.
 */
export interface TransactionInitializationResult {
    /**
     * Paystack hosted payment URL.
     */
    authorizationUrl: string;

    /**
     * Unique Paystack transaction reference.
     */
    reference: string;

    /**
     * Paystack access code.
     */
    accessCode: string;
}

export interface SubscriptionDTO {
    email: string;
    amount?: number;
    planCode?: string;
    currency?: Currency;
}
