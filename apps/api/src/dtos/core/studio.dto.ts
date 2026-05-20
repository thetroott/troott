import type {
    StudioRole,
    StudioStatus,
    StudioType,
} from '@/interfaces/core/studio.interface';

/**
 * Create studio request body.
 * Legacy flat fields (`description`, `branchName`, `logo`, `country`, `city`)
 * map onto `IStudioDoc.profile` and `country` where noted.
 */
export interface CreateStudioDTO {
    name: string;
    category: StudioType;
    slug?: string;
    isPublic?: boolean;
    /** Explicit minister owner (must belong to authenticated user unless admin). */
    ownerMinisterId?: string;
    /** Explicit creator owner (must belong to authenticated user unless admin). */
    ownerCreatorId?: string;
    /** Overrides registration email when set. */
    email?: string;
    avatar?: string;
    /** Public / cover imagery; maps to `profile.banner`. */
    banner?: string;
    /** Maps to `profile.ministryLogo`. */
    logo?: string;
    /** Maps to `profile.ministryName`. */
    branchName?: string;
    /** Maps to `profile.description`. */
    description?: string;
    /** Legacy ISO-3166 alpha-2 hint; merged into `country` when no minister/creator defaults. */
    country?: string;
    /** Merged into `profile.ministryHQLocation.city` when no HQ from profile. */
    city?: string;
    tags?: string[];
    /** Topic document ids. */
    topics?: string[];
}

export interface UpdateStudioDTO {
    studioId: string;
    name?: string;
    /** Maps to `profile.description`. */
    description?: string;
    slug?: string;
    isPublic?: boolean;
    avatar?: string;
    /** Maps to `profile.banner`. */
    banner?: string;
    /** Maps to `profile.ministryLogo`. */
    logo?: string;
    /** Maps to `profile.ministryName`. */
    branchName?: string;
    country?: string;
    city?: string;
    tags?: string[];
    topics?: string[];
    status?: StudioStatus;
    category?: StudioType;
}

export interface CreateStudioInviteDTO {
    studioId: string;
    email?: string;
    userId?: string;
    role: StudioRole;
    expiresAt?: string;
}

export interface StudioInviteActionDTO {
    studioId: string;
    inviteId: string;
}
