import type {
    IPlanPaystackCode,
    IPlanPricing,
    IPlanTrial,
    PlanType,
} from '@/dtos/api-domain';

export interface PlanSermonQuota {
    limit: number;
    frequency: string;
}

export interface Plan {
    id: string;
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
    sermon: PlanSermonQuota;
    sermonBite: PlanSermonQuota;
    paystackPlanCodes: IPlanPaystackCode;
    createdAt: string;
    updatedAt: string;
    _version?: number;
    _id?: string;
}

export default Plan;
