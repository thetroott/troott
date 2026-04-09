import { Document, Types } from 'mongoose';

// Use Mongoose's Types.ObjectId for interface compatibility
export type ObjectId = Types.ObjectId;

export interface IShareableLinkDoc extends Document {
    linkType: ShareableLinkType;
    resourceId: ObjectId;
    createdBy: ObjectId;

    // Token information
    token: string; // Encrypted token
    rawToken?: string; // Plain token (not stored, only returned on creation)

    // Link configuration
    linkName?: string; // Optional name/purpose for the link
    expiresAt: Date;
    isActive: boolean;
    isRevoked: boolean;
    revokedAt?: Date;

    // Access control metadata
    metadata: Record<string, unknown>; // Resource-specific metadata (allowedDomains, accessLevel, etc.)

    // Usage tracking (optional)
    accessCount?: number;
    lastAccessedAt?: Date;

    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}

// ENUMS

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
