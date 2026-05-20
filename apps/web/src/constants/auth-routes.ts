/**
 * Canonical public auth URLs for Troott web.
 * Use these constants in routes, useAuth guards, and auth forms — do not hardcode paths.
 *
 * Not auth routes: `/get-started/verify-account` (private minister KYC).
 */
export const AUTH_ROUTES = {
    login: '/login',
    register: '/register',
    activateAccount: '/activate-account',
    verifyOtp: '/verify-otp',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    changePassword: '/profile/change-password',
} as const;

/** Legacy path removed after migration; redirect only in public routes. */
export const AUTH_ROUTE_ACTIVATE_LEGACY = '/activate';

/** Paths reachable without a JWT (useAuth session guard). */
export const AUTH_PUBLIC_PATH_PREFIXES = [
    AUTH_ROUTES.register,
    AUTH_ROUTES.activateAccount,
    AUTH_ROUTE_ACTIVATE_LEGACY,
    AUTH_ROUTES.verifyOtp,
    AUTH_ROUTES.forgotPassword,
    AUTH_ROUTES.resetPassword,
    '/invite',
] as const;

export function isAuthPublicPath(pathname: string): boolean {
    return AUTH_PUBLIC_PATH_PREFIXES.some((p) => pathname.includes(p));
}

/** Paths where an authenticated user should be sent to the app (not stay on auth UI). */
export const AUTH_ENTRY_REDIRECT_PATHS = [
    AUTH_ROUTES.login,
    '/',
] as const;

export function isAuthEntryRedirectPath(pathname: string): boolean {
    return AUTH_ENTRY_REDIRECT_PATHS.some(
        (p) => pathname === p || pathname === `${p}/`,
    );
}
