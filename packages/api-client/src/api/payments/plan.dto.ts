export interface IPlanPricing {
    naira?: { monthly?: number; yearly?: number };
    dollar?: { monthly?: number; yearly?: number };
}

export interface IPlanTrial {
    days: number;
    enabled: boolean;
}

export interface PlanDTO {
    code?: string;
    label?: string;
    planType?: string;
    name?: string;
    displayName?: string;
    isEnabled?: boolean;
    description?: string;
    trial?: IPlanTrial;
    pricing?: IPlanPricing;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
    _version?: number;
    _id?: string;
    id?: string;
    [key: string]: unknown;
}

export default PlanDTO;
