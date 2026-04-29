export interface CreateShareableLinkDTO {
    linkType: ShareableLinkType;
    resourceId: string;
    createdBy: string;
    expiresInDays?: number;
    linkName?: string;
    metadata?: Record<string, unknown>;
}

export interface ValidateShareableLinkDTO {
    token: string;
    resourceId: string;
    linkType?: ShareableLinkType; // Optional for validation, but recommended
}

export interface RevokeShareableLinkDTO {
    resourceId: string;
    linkType: ShareableLinkType;
    token?: string; // If not provided, revoke all links for the resource
    createdBy?: string; // Optional: only revoke links created by this user
}

export interface GetShareableLinksDTO {
    resourceId: string;
    linkType: ShareableLinkType;
    includeRevoked?: boolean;
    includeExpired?: boolean;
}

export interface UpdateShareableLinkDTO {
    token: string;
    resourceId: string;
    linkType: ShareableLinkType;
    expiresInDays?: number;
    linkName?: string;
    metadata?: Record<string, unknown>;
    isActive?: boolean;
}

export enum ShareableLinkType {
    WORKSPACE = 'workspace',
    HACKATHON = 'hackathon',
    PROJECT = 'project',
    ENTRY = 'entry',
    SUBMISSION = 'submission',
    TEAM = 'team',
    SQUAD = 'squad',
    TASK = 'task',
    FORM = 'form',
    PORTFOLIO = 'portfolio',
    TEMPLATE = 'template',
    CAMPAIGN = 'campaign',
}

export enum ShareableLinkStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}
