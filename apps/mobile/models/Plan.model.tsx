export enum PlanType {
    FOR_BUSINESS = 'business',
    FOR_LISTENER = 'listener',
}

export interface IPlanPricing {
    naira: {
        monthly: number;
        yearly: number;
    };
    dollar: {
        monthly: number;
        yearly: number;
    };
}

export interface IPlanTrial {
    days: number;
    enabled: boolean;
}

export interface IPlanPaystackCode {
    nairaMonthly: string;
    nairaYearly: string;
    dollarMonthly: string;
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

interface Plan {
    code: string;
    slug: string;

    label: string;
    planType: PlanType;
    name: string;
    displayName: string;
    isEnabled: boolean;
    description: string;
    trial: IPlanTrial;
    pricing: IPlanPricing;

    sermon: {
        limit: number;
        frequency: string;
    };
    sermonBite: {
        limit: number;
        frequency: string;
    };

    paystackPlanCodes: IPlanPaystackCode;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default Plan;
