import { UserType } from '@/models/User.model';
import {
    isAdminPortalRole,
    isStudioContentRole,
    INTERNAL_PORTAL_ROLES,
} from '@/utils/roles.util';
import {
    isAuthPublicPath,
    normalizePathname,
    PATH_ADMIN_PREFIX,
    PATH_LOGIN,
    PATH_UNAUTHORIZED,
} from '@/routes/paths';

/** `location.state.reason` on `/unauthorized` for listener accounts. */
export const UNAUTHORIZED_REASON_LISTENER = 'listener-portal';

export function normalizeUserType(raw: string): string {
    const n = String(raw || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
    if (n === 'super-admin' || n === 'superadmin') {
        return UserType.SUPER;
    }
    return n;
}

export function isListenerLikeUserType(
    userType: string | null | undefined,
): boolean {
    const ut = normalizeUserType(userType ?? '');
    return ut === UserType.LISTENER || ut === UserType.USER;
}

export function isInternalPortalUserType(
    userType: string | null | undefined,
): boolean {
    const ut = normalizeUserType(userType ?? '');
    return INTERNAL_PORTAL_ROLES.some(
        (r) => normalizeUserType(r) === ut,
    );
}

/** Post-login deep link from AuthGate `state.from` — must be in-app and protected. */
export function isSafeReturnPath(path: string | undefined | null): boolean {
    if (!path || typeof path !== 'string') {
        return false;
    }
    const p = normalizePathname(path);
    if (!p.startsWith('/') || p.includes('//')) {
        return false;
    }
    if (p === PATH_LOGIN || p === PATH_UNAUTHORIZED) {
        return false;
    }
    if (isAuthPublicPath(p)) {
        return false;
    }
    return true;
}

export function canAccessReturnPath(
    userType: string,
    path: string,
): boolean {
    if (!isSafeReturnPath(path)) {
        return false;
    }
    const p = normalizePathname(path);
    const ut = normalizeUserType(userType);

    if (isListenerLikeUserType(ut)) {
        return false;
    }

    if (p.startsWith(PATH_ADMIN_PREFIX)) {
        return isAdminPortalRole(ut);
    }

    if (p.startsWith('/studio/')) {
        return isStudioContentRole(ut);
    }

    if (p.startsWith('/get-started')) {
        return (
            ut === UserType.MINISTER ||
            isStudioContentRole(ut) ||
            isAdminPortalRole(ut)
        );
    }

    if (p.startsWith('/profile') || p.startsWith('/settings')) {
        return isInternalPortalUserType(ut);
    }

    return false;
}
