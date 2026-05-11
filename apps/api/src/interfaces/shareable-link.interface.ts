import { Document, Types } from 'mongoose';

export type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a shareable link.
 *
 * Shareable links provide time-limited, token-secured access to a
 * specific resource (sermon, series, playlist, minister profile, etc.)
 * without requiring the recipient to be authenticated. The token is
 * encrypted at rest; a SHA-256 lookup hash enables resolution from
 * deep-link URLs without exposing the raw token.
 */
export interface IShareableLinkDoc extends Document {
    /** Type of resource this link grants access to. */
    linkType: ShareableLinkType;
    /** ID of the target resource. */
    resourceId: ObjectId;
    /** User who generated the link. */
    createdBy: ObjectId;

    /** Encrypted token stored in the database. */
    token: string;
    /** SHA-256 hash of the raw token for O(1) lookup by deep-link resolver. */
    tokenLookupHash?: string;
    /** Plain-text token (transient -- returned on creation only, never persisted). */
    rawToken?: string;

    /** Optional human-readable name or purpose for the link. */
    linkName?: string;
    /** When the link becomes invalid. */
    expiresAt: Date;
    /** Whether the link is currently usable. */
    isActive: boolean;
    /** Whether the link has been explicitly revoked. */
    isRevoked: boolean;
    /** When the link was revoked, if applicable. */
    revokedAt?: Date;

    /** Resource-specific metadata (e.g. allowed domains, access level). */
    metadata: Record<string, unknown>;

    /** Number of times the link has been accessed. */
    accessCount?: number;
    /** When the link was last accessed. */
    lastAccessedAt?: Date;

    /** When the link was created. */
    createdAt: Date;
    /** When the link was last updated. */
    updatedAt: Date;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/** Resource types that can be shared via a link. */
export enum ShareableLinkType {
    SERMON = 'sermon',
    SERIES = 'series',
    PLAYLIST = 'playlist',
    MINISTER = 'minister',
    LIBRARY = 'library',
    BITE = 'bite',
    FORM = 'form',
    CAMPAIGN = 'campaign',
}

/** Lifecycle status of a shareable link. */
export enum ShareableLinkStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}
