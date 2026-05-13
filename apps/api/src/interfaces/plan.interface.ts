import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a subscription plan.
 *
 * Plans define what a listener or business pays for and how much.
 * Each plan has pricing in multiple currencies, optional trial
 * periods, and Paystack-specific plan codes for payment integration.
 */
interface IPlanDoc extends Document {
    /** Short unique code. */
    code: string;
    /** URL-safe slug. */
    slug: string;

    /** Display label shown in the UI (e.g. `Premium`, `Basic`). */
    label: string;
    /** Target audience for this plan. */
    planType: PlanType;
    /** Internal name (machine-readable). */
    name: string;
    /** User-facing name. */
    displayName: string;
    /** Whether the plan is available for new subscriptions. */
    isEnabled: boolean;
    /** Plan description shown on the pricing page. */
    description: string;
    /** Free trial configuration. */
    trial: IPlanTrial;
    /** Pricing tiers by currency and frequency. */
    pricing: IPlanPricing;

    /** Sermon access limits for this plan. */
    sermon: {
        /** Maximum sermons accessible per billing period. */
        limit: number;
        /** Billing frequency label (e.g. `monthly`, `yearly`). */
        frequency: string;
    };
    /** Sermon bite (clip) access limits for this plan. */
    sermonBite: {
        /** Maximum bites accessible per billing period. */
        limit: number;
        /** Billing frequency label. */
        frequency: string;
    };

    /** Paystack plan codes used to initiate subscriptions. */
    paystackPlanCodes: IPlanPaystackCode;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/** Multi-currency pricing tiers for a plan. */
export interface IPlanPricing {
    /** Nigerian Naira pricing. */
    naira: {
        /** Monthly price in kobo (NGN * 100). */
        monthly: number;
        /** Yearly price in kobo. */
        yearly: number;
    };
    /** US Dollar pricing. */
    dollar: {
        /** Monthly price in cents (USD * 100). */
        monthly: number;
        /** Yearly price in cents. */
        yearly: number;
    };
}

/** Free trial configuration for a plan. */
export interface IPlanTrial {
    /** Number of free trial days. */
    days: number;
    /** Whether the trial is currently available. */
    enabled: boolean;
}

/** Target audience for a subscription plan. */
export enum PlanType {
    /** Plans sold to ministry organisations. */
    FOR_BUSINESS = 'business',
    /** Plans sold to individual listeners. */
    FOR_LISTENER = 'listener',
}

/** Paystack plan codes for each currency + frequency combination. */
export interface IPlanPaystackCode {
    /** Naira monthly plan code. */
    nairaMonthly: string;
    /** Naira yearly plan code. */
    nairaYearly: string;
    /** Dollar monthly plan code. */
    dollarMonthly: string;
    /** Dollar yearly plan code. */
    dollarYearly: string;
}

export enum PlanInterval {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export enum PlanPriceCurrency {
    NGN = 'NGN',
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    NAIRA = 'NGN',
    DOLLAR = 'USD',
}

export interface IPlanFilterOptions {
    type?: string;
    status?: string;
    isEnabled?: boolean;
}

export type { IPlanDoc };
export default IPlanDoc;
