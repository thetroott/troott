/**
 * Paystack-specific DTOs for the payment integration layer.
 *
 * These shapes map directly to the Paystack REST API request bodies
 * and are used by the payment service to initiate transactions,
 * create plans, and verify webhooks.
 */

/** Request body for Paystack's `POST /transaction/initialize` endpoint. */
export interface initializePaymentDTO {
    /** Payer's email address. */
    email: string;
    /** Amount in kobo (NGN * 100). */
    amount: string;
    /** Paystack plan code (for subscription charges). */
    plan?: string;
    /** Arbitrary metadata forwarded to webhooks. */
    metadata?: Record<string, any>;
    /** URL to redirect the user after payment. */
    callback_url?: string;
}

/** Request body for Paystack's `POST /plan` endpoint. */
export interface CreatePlanDTO {
    /** Plan display name. */
    name: string;
    /** Amount in kobo. */
    amount: number;
    /** Billing interval (`daily`, `weekly`, `monthly`, `annually`). */
    interval: string;
    /** Plan description. */
    description: string;
    /** ISO-4217 currency code (defaults to `NGN`). */
    currency?: string;
}

/** Inputs for verifying a Paystack webhook signature. */
export interface verifWebhookDTO {
    /** `x-paystack-signature` header value. */
    signature: string;
    /** Paystack webhook secret from the dashboard. */
    paystackSecret: string;
    /** Raw request body. */
    payload: string | Buffer;
}
