import type { ICountry } from '@/utils/interfaces.util';
import type { ILocation } from '@/dtos/common-fields';
import type { ISocials } from '@/dtos/api-domain';
import { StudioRole, StudioStatus, StudioType } from '@/dtos/api-domain';

export interface StudioProfile {
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

export interface StudioMember {
    user: string;
    role: StudioRole;
    joinedAt: string;
    invitedBy?: string;
    permissions?: string[];
}

export interface StudioInvite {
    id?: string;
    user?: string;
    email?: string;
    role: StudioRole;
    invitedBy: string;
    invitedAt: string;
    expiresAt?: string;
}

export interface Studio {
    id: string;
    code: string;
    slug: string;
    name: string;
    country?: ICountry;
    avatar?: string;
    email?: string;
    profile?: StudioProfile;
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
    members?: StudioMember[];
    invites?: StudioInvite[];
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    _version?: number;
    _id?: string;
}

export default Studio;
