import type { ICountry } from '@/utils/interfaces.util';
import type { ILocation } from './common-fields';
import type { ISocials } from './api-domain';
import { StudioRole, StudioStatus, StudioType } from './api-domain';

/** Create studio request body (`POST /studios`). */
export interface CreateStudioDTO {
    name: string;
    category: StudioType;
    slug?: string;
    isPublic?: boolean;
    ownerMinisterId?: string;
    ownerCreatorId?: string;
    email?: string;
    avatar?: string;
    banner?: string;
    logo?: string;
    branchName?: string;
    description?: string;
    country?: string;
    city?: string;
    tags?: string[];
    topics?: string[];
}

/** Patch studio body (`PATCH /studios/:id`). */
export interface UpdateStudioDTO {
    name?: string;
    description?: string;
    slug?: string;
    isPublic?: boolean;
    avatar?: string;
    banner?: string;
    logo?: string;
    branchName?: string;
    country?: string;
    city?: string;
    tags?: string[];
    topics?: string[];
    status?: StudioStatus;
    category?: StudioType;
}

export interface CreateStudioInviteDTO {
    email?: string;
    userId?: string;
    role: StudioRole;
    expiresAt?: string;
}

export interface StudioProfileDTO {
    description?: string;
    ministryName?: string;
    ministryLogo?: string;
    banner?: string;
    ministryType?: string;
    ministryHQLocation?: Partial<ILocation>;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    email?: string;
    websiteUrl?: string;
    socials?: ISocials[];
    languages?: string[];
    members?: string[];
}

export interface StudioMemberDTO {
    user: string;
    role: StudioRole;
    joinedAt: string;
    invitedBy?: string;
    permissions?: string[];
}

export interface StudioInviteDTO {
    id?: string;
    user?: string;
    email?: string;
    role: StudioRole;
    invitedBy: string;
    invitedAt: string;
    expiresAt?: string;
}

export interface StudioResponseDTO {
    id: string;
    code: string;
    slug: string;
    name: string;
    country?: ICountry;
    avatar?: string;
    email?: string;
    profile?: StudioProfileDTO;
    parentStudio?: string;
    category: StudioType;
    isPublic: boolean;
    isVerified: boolean;
    followers?: number;
    totalListeners?: number;
    monthlyListeners?: number;
    totalSermons?: number;
    totalSeries?: number;
    totalPlays?: number;
    tags?: string[];
    topics?: string[];
    status: StudioStatus;
    members?: StudioMemberDTO[];
    invites?: StudioInviteDTO[];
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MyStudioResponseDTO {
    studio: StudioResponseDTO | null;
    role: StudioRole | null;
}

export interface StudioInviteCreatedDTO {
    inviteId: string;
}
