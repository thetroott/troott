import { UserType } from '@/models/User.model';

/** Minister + creator — YouTube-style studio routes. */
export const STUDIO_CONTENT_ROLES: UserType[] = [
    UserType.MINISTER,
    UserType.CREATOR,
];

/** Platform admin console under /admin. */
export const ADMIN_PORTAL_ROLES: UserType[] = [
    UserType.ADMIN,
    UserType.SUPER,
];

/** Accounts that use the internal web portal (not listener-first mobile). */
export const INTERNAL_PORTAL_ROLES: UserType[] = [
    ...ADMIN_PORTAL_ROLES,
    ...STUDIO_CONTENT_ROLES,
];

export function isStudioContentRole(
    userType: string | null | undefined,
): boolean {
    const normalized = String(userType || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
    return STUDIO_CONTENT_ROLES.some(
        (r) => r.toLowerCase().replace(/_/g, '-') === normalized,
    );
}

export function isAdminPortalRole(
    userType: string | null | undefined,
): boolean {
    const normalized = normalizePortalUserType(userType);
    return (
        normalized === UserType.ADMIN || normalized === UserType.SUPER
    );
}

/** Cookie/session userType → portal enum (preserves superadmin vs admin). */
export function normalizePortalUserType(
    userType: string | null | undefined,
): UserType {
    const normalized = String(userType || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');

    if (normalized === UserType.SUPER || normalized === 'super-admin') {
        return UserType.SUPER;
    }
    if (normalized === UserType.ADMIN) {
        return UserType.ADMIN;
    }
    if (normalized === UserType.CREATOR) {
        return UserType.CREATOR;
    }
    if (normalized === UserType.MINISTER) {
        return UserType.MINISTER;
    }
    return UserType.MINISTER;
}
