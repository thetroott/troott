import {
    IPlanPaystackCode,
    IPlanPricing,
    IPlanTrial,
    PlanType,
} from './api-domain';

export interface CreatePlanDTO {
    name: string;
    label: string;
    planType: PlanType;
    displayName: string;
    description: string;
    isEnabled?: boolean;
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
    paystackPlanCodes?: IPlanPaystackCode;
}

export interface UpdatePlanDTO {
    planId: string;
    updates: Partial<Omit<CreatePlanDTO, 'planType'>>;
}

export enum AllowedPlanUpdateField {
    NAME = 'name',
    LABEL = 'label',
    DISPLAY_NAME = 'displayName',
    DESCRIPTION = 'description',
    IS_ENABLED = 'isEnabled',
    TRIAL = 'trial',
    PRICING = 'pricing',
    SERMON = 'sermon',
    SERMON_BITE = 'sermonBite',
    PAYSTACK_PLAN_CODES = 'paystackPlanCodes',
}

export interface PlanAvailabilityDTO {
    isAvailable: boolean;
    data: {
        trial: IPlanTrial;
        paystackCodes: IPlanPaystackCode;
    } | null;
}

export interface PlanResponseDTO {
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
}
