import {
    IPlanPaystackCode,
    IPlanPricing,
    IPlanTrial,
    PlanType,
} from './plan.interface';

export interface newPlanDTO {
    name: string;
    label: string;
    planType: PlanType;
    displayName: string;
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
}

export interface updatePlanDTO {
    planId: string;
    updates: Partial<newPlanDTO>;
}

// export interface allowedPlanUpdateDTO extends newPlanDTO {}

export enum allowedPlanUpdateDTO {
    NAME = 'name',
    LABEL = 'label',
    PLAN_TYPE = 'planType',
    DISPLAY_NAME = 'displayName',
    DESCRIPTION = 'description',
    TRIAL = 'trial',
    PRICING = 'pricing',
    MEMBERS = 'members',
    DOMAINS = 'domains',
    PROJECTS = 'projects',
}

export interface planAvailabilityDTO {
    isAvailable: boolean;
    data: {
        trial: IPlanTrial;
        paystackCodes: IPlanPaystackCode;
    } | null;
}
