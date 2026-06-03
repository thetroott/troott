/**
 * Canonical Profile contract on the web.
 *
 * Mirrors `apps/api/src/modules/users/profile/profile.dto.ts`. `MinisterProfile`
 * extends `ListenerProfile` - one form, one endpoint, one mapper. The Edit
 * Profile dialog (Figma node 11719:104736 / 11732:105889) and the Profile page
 * (node 11745:106250) both branch off `userType`.
 */

import { UserType } from '@/models/User.model';
export { UserType };

export interface Asset {
    fileName: string;
    s3Key: string;
    /** Display URL from `ImageDTO.file` — not sent on PUT. */
    url?: string;
}

export interface ProfileSocials {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
}

export interface ProfileBase {
    id: string;
    userType: UserType;
    firstName: string;
    lastName: string;
    email: string;
    slug?: string;
    bio?: string;
    avatar?: Asset | null;
    coverImage?: Asset | null;
    phoneNumber?: string;
    phoneCode?: string;
    countryPhone?: string;
    /** Public contact email from nested profile when distinct from account email. */
    profileEmail?: string;
    monthlyListeners?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ListenerProfile extends ProfileBase {
    userType: UserType.LISTENER | UserType.USER;
}

export interface MinisterProfile extends ProfileBase {
    userType: UserType.MINISTER;
    ministerialName?: string;
    ministryName?: string;
    ministryHQLocation?: string;
    ministryWebsite?: string;
    socials?: ProfileSocials;
}

export type ProfileDTO = ListenerProfile | MinisterProfile;

/** Aggregated read-model for insight cards (feat-0024). */
export interface ProfileInsightStats {
    sermonsPublished?: number;
    totalListens?: number;
    followers?: number;
}

export interface UpdateProfilePayload {
    bio?: string;
    avatar?: Asset | null;
    coverImage?: Asset | null;
    ministry?: {
        ministerialName?: string;
        ministryName?: string;
        ministryHQLocation?: string;
        ministryWebsite?: string;
        socials?: ProfileSocials;
    };
}

/**
 * Form values used by `EditProfileDialog`. Strings default to `''` so React
 * treats inputs as controlled. Image slots are nullable assets; `null` means
 * "removed by user".
 */
export interface BaseProfileFormValues {
    bio: string;
    avatar: Asset | null;
    coverImage: Asset | null;
}

export interface MinisterProfileFormValues extends BaseProfileFormValues {
    kind: 'minister';
    ministerialName: string;
    ministryName: string;
    ministryHQLocation: string;
    ministryWebsite: string;
    instagram: string;
    twitter: string;
    tiktok: string;
}

export interface ListenerProfileFormValues extends BaseProfileFormValues {
    kind: 'listener';
}

export type ProfileFormValues =
    | ListenerProfileFormValues
    | MinisterProfileFormValues;

export const isMinisterProfile = (
    p: ProfileDTO,
): p is MinisterProfile => p.userType === UserType.MINISTER;

/**
 * Map a server `ProfileDTO` into form values. Inheritance is realised via
 * composition: `mapBase` writes the shared fields, the minister branch adds
 * ministry slots on top.
 */
export function mapProfileToFormValues(p: ProfileDTO): ProfileFormValues {
    const base: BaseProfileFormValues = {
        bio: p.bio ?? '',
        avatar: p.avatar ?? null,
        coverImage: p.coverImage ?? null,
    };
    if (isMinisterProfile(p)) {
        return {
            ...base,
            kind: 'minister',
            ministerialName: p.ministerialName ?? '',
            ministryName: p.ministryName ?? '',
            ministryHQLocation: p.ministryHQLocation ?? '',
            ministryWebsite: p.ministryWebsite ?? '',
            instagram: p.socials?.instagram ?? '',
            twitter: p.socials?.twitter ?? '',
            tiktok: p.socials?.tiktok ?? '',
        };
    }
    return { ...base, kind: 'listener' };
}

/**
 * Map form values back to a partial update payload, only including fields the
 * user actually changed compared to `initial`. Empty strings are sent as `''`
 * (clear); removed assets are sent as explicit `null`.
 */
export function mapFormValuesToUpdatePayload(
    initial: ProfileFormValues,
    current: ProfileFormValues,
): UpdateProfilePayload {
    const payload: UpdateProfilePayload = {};

    if (initial.bio !== current.bio) {
        payload.bio = current.bio;
    }
    if (!sameAsset(initial.avatar, current.avatar)) {
        payload.avatar = current.avatar;
    }
    if (!sameAsset(initial.coverImage, current.coverImage)) {
        payload.coverImage = current.coverImage;
    }

    if (current.kind === 'minister' && initial.kind === 'minister') {
        const ministry: NonNullable<UpdateProfilePayload['ministry']> = {};
        if (initial.ministerialName !== current.ministerialName) {
            ministry.ministerialName = current.ministerialName;
        }
        if (initial.ministryName !== current.ministryName) {
            ministry.ministryName = current.ministryName;
        }
        if (initial.ministryHQLocation !== current.ministryHQLocation) {
            ministry.ministryHQLocation = current.ministryHQLocation;
        }
        if (initial.ministryWebsite !== current.ministryWebsite) {
            ministry.ministryWebsite = current.ministryWebsite;
        }
        const socials: ProfileSocials = {};
        let socialsChanged = false;
        if (initial.instagram !== current.instagram) {
            socials.instagram = current.instagram;
            socialsChanged = true;
        }
        if (initial.twitter !== current.twitter) {
            socials.twitter = current.twitter;
            socialsChanged = true;
        }
        if (initial.tiktok !== current.tiktok) {
            socials.tiktok = current.tiktok;
            socialsChanged = true;
        }
        if (socialsChanged) {
            ministry.socials = socials;
        }
        if (Object.keys(ministry).length > 0) {
            payload.ministry = ministry;
        }
    }

    return payload;
}

function sameAsset(a: Asset | null, b: Asset | null): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    return (
        a.s3Key === b.s3Key &&
        (a.url ?? '') === (b.url ?? '') &&
        (a.fileName ?? '') === (b.fileName ?? '')
    );
}
