import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

export interface IPlanDoc extends Document {
    code: string;
    label: string;
    planType: PlanType;
    name: string;
    displayName: string;
    isEnabled: boolean;
    description: string;
    trial: IPlanTrial;
    pricing: IPlanPricing;
    members: {
        limit: number;
        frequency: string;
    };
    domains: {
        limit: number;
        frequency: string;
    };
    projects: {
        limit: number;
        frequency: string;
    };

    slug: string;

    paystackPlanCodes: IPlanPaystackCode;

    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

export interface IPlanTrial {
    days: number;
    enabled: boolean;
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

export enum PlanType {
    FOR_BUSINESS = 'business',
    FOR_LISTENER = 'listener',
}

export enum PlanInterval {
    MONTHLY = 'monthly',
    YEARLY = 'annually',
}
export interface IPlanPaystackCode {
    nairaMonthly: string;
    nairaYearly: string;
    dollarMonthly: string;
    dollarYearly: string;
}

export enum PlanPriceCurrency {
    NAIRA = 'NGN',
    DOLLAR = 'USD',
}

export enum PlanStatus {
    ENABLED = 'enabled',
    DISABLED = 'disabled',
}
export interface IPlanFilterOptions {
    select?: string;
    sort?: string;
    page?: number;
    limit?: number;
    type?: string | PlanType;
    isEnabled?: boolean;
}
