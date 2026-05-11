import { Upload, UserType } from '@/modules/users/user/user.interface';
import type { IProfileSocials } from '@/modules/users/minister/minister.interface';

/**
 * Canonical Profile contract.
 *
 * `MinisterProfileDTO` extends `BaseProfileDTO` with ministry fields. Listener and
 * minister flows go through one endpoint family (`/profile/me`), one mapper, and
 * one form on the web. See plan: `.cursor/plans/profile-functionality-three-screens_*.plan.md`.
 *
 * Source-of-truth field map for editor (Figma node 11719:104736 / 11732:105889):
 * - Background image -> `coverImage` (Upload, base)
 * - Profile picture -> `avatar` (Upload, base)
 * - Minister's Name -> `ministerialName` (minister)
 * - Ministry Name -> `ministryName` (minister)
 * - Bio (Figma label "Ministry Name" / About textarea) -> `bio` (base)
 * - Location -> `ministryHQLocation` (minister)
 * - Social handles -> `socials.{instagram,twitter,tiktok}` (minister)
 */
export interface BaseProfileDTO {
    id: string;
    userType: UserType;
    firstName: string;
    lastName: string;
    email: string;
    slug?: string;
    bio?: string;
    avatar?: Upload | null;
    coverImage?: Upload | null;
    createdAt: string;
    updatedAt: string;
}

export interface ListenerProfileDTO extends BaseProfileDTO {
    userType: UserType.LISTENER | UserType.USER;
}

export interface MinisterProfileDTO extends BaseProfileDTO {
    userType: UserType.MINISTER;
    ministerialName?: string;
    ministryName?: string;
    ministryHQLocation?: string;
    ministryWebsite?: string;
    socials?: IProfileSocials;
}

export type ProfileDTO = ListenerProfileDTO | MinisterProfileDTO;

/**
 * Request payload for `PUT /profile/me`.
 *
 * Every field is optional so partial updates are first-class. Image fields accept
 * either an `Upload` (set / replace) or `null` (remove). String fields accept
 * empty string to clear.
 */
export interface UpdateProfilePayloadDTO {
    bio?: string;
    avatar?: Upload | null;
    coverImage?: Upload | null;
    ministry?: {
        ministerialName?: string;
        ministryName?: string;
        ministryHQLocation?: string;
        ministryWebsite?: string;
        socials?: IProfileSocials;
    };
}
