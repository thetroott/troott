interface Plan {
code: string,
    label: string,
    planType: string,
    name: string,
    displayName: string,
    isEnabled: boolean,
    description: string,
    trial: IPlanTrial,
    pricing: IPlanPricing,
    assessment: {
        limit: number,
        frequency: string,
    },
    task: {
        limit: number,
        frequency: string,
    },
    project: {
        limit: number,
        frequency: string,
    },
    career: {
        limit: number
    },
    talents: {
        limit: number
    },
    growth: {
        report: boolean
    },
    slug: string

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;

}

export interface IPlanPricing {
    naira: {
        monthly: number,
        yearly: number,
    },
    dollar: {
        monthly: number,
        yearly: number,
    }
}

export interface IPlanTrial {
    days: number,
    enabled: boolean
}

export default Plan;