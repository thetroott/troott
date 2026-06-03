/** Canonical Troott web paths — single source of truth for URL strings. */

// Auth (public)
export const PATH_ROOT = '/';
export const PATH_LOGIN = '/login';
export const PATH_REGISTER = '/register';
export const PATH_ACTIVATE_ACCOUNT = '/activate-account';
export const PATH_VERIFY_OTP = '/verify-otp';
export const PATH_FORGOT_PASSWORD = '/forgot-password';
export const PATH_RESET_PASSWORD = '/reset-password';

// Portal global (not studio-scoped)
export const PATH_GET_STARTED = '/get-started';
export const PATH_GET_STARTED_PREFIX = '/get-started';

/** True when pathname is the Get Started hub or any nested onboarding screen. */
export function isGetStartedPath(pathname: string): boolean {
    const normalized = pathname.split('?')[0]?.replace(/\/+$/, '') || '/';
    return (
        normalized === PATH_GET_STARTED ||
        normalized.startsWith(`${PATH_GET_STARTED}/`)
    );
}
export const PATH_PROFILE = '/profile';
export const PATH_SETTINGS = '/settings';

// Studio — base + segments (YouTube-style)
/** React Router parent only — includes :studioCode */
export const PATH_STUDIO = '/studio/:studioCode';
/** Navigation prefix — concrete code appended at call site */
export const PATH_STUDIO_PREFIX = '/studio';

export const PATH_SEG_SERMONS = 'sermons';
export const PATH_SEG_SERMONS_UPLOAD = 'sermons/upload';
export const PATH_SEG_SERMONS_UPLOAD_FILE = 'sermons/upload/file';
export const PATH_SEG_SERMONS_UPLOAD_DETAILS = 'sermons/upload/details';
export const PATH_SEG_SERMONS_UPLOAD_THUMBNAIL = 'sermons/upload/thumbnail';
export const PATH_SEG_SERMONS_UPLOAD_PUBLISH = 'sermons/upload/publish';
export const PATH_SEG_SERMONS_ID = 'sermons/:sermonId';
export const PATH_SEG_SERMONS_ID_RESUME = 'sermons/:sermonId/resume';
export const PATH_SEG_SERMONS_ID_EDIT = 'sermons/:sermonId/edit';
export const PATH_SEG_SERMONS_ID_ANALYTICS = 'sermons/:sermonId/analytics';
export const PATH_SEG_ANALYTICS = 'analytics';
export const PATH_SEG_BIN = 'bin';

/** Upload wizard segment keys (under `/studio/:studioCode/`). */
export type StudioUploadSegment =
    | typeof PATH_SEG_SERMONS_UPLOAD
    | typeof PATH_SEG_SERMONS_UPLOAD_FILE
    | typeof PATH_SEG_SERMONS_UPLOAD_DETAILS
    | typeof PATH_SEG_SERMONS_UPLOAD_THUMBNAIL
    | typeof PATH_SEG_SERMONS_UPLOAD_PUBLISH;

function normalizeStudioCodeForPath(studioCode: string): string {
    return studioCode.trim().toLowerCase();
}

/** Studio home URL (`/studio/{code}`). */
export function studioHomePath(studioCode: string): string {
    return `${PATH_STUDIO_PREFIX}/${normalizeStudioCodeForPath(studioCode)}`;
}

/** Studio-scoped upload wizard URL. */
export function studioUploadPath(
    studioCode: string,
    segment: StudioUploadSegment,
): string {
    return `${PATH_STUDIO_PREFIX}/${normalizeStudioCodeForPath(studioCode)}/${segment}`;
}

/** Studio sermons list URL. */
export function studioSermonsListPath(studioCode: string): string {
    return `${PATH_STUDIO_PREFIX}/${normalizeStudioCodeForPath(studioCode)}/${PATH_SEG_SERMONS}`;
}

/** Studio sermon edit (details) page URL. */
export function studioSermonEditPath(
    studioCode: string,
    sermonId: string,
): string {
    const id = sermonId.trim();
    return `${PATH_STUDIO_PREFIX}/${normalizeStudioCodeForPath(studioCode)}/sermons/${encodeURIComponent(id)}/edit`;
}

const STUDIO_SERMON_WORKSPACE_PATH_RE =
    /^\/studio\/[^/]+\/sermons\/[^/]+\/(edit|analytics)\/?$/i;

/** Sermon edit workspace — details or in-sidebar analytics (feat-0022 / feat-0023). */
export function isStudioSermonWorkspacePath(pathname: string): boolean {
    const normalized = pathname.replace(/\/+$/, '') || '/';
    return STUDIO_SERMON_WORKSPACE_PATH_RE.test(normalized);
}

/** @deprecated Use `isStudioSermonWorkspacePath` */
export function isStudioSermonEditPath(pathname: string): boolean {
    return isStudioSermonWorkspacePath(pathname);
}

/** Studio analytics URL. */
export function studioAnalyticsPath(studioCode: string): string {
    return `${PATH_STUDIO_PREFIX}/${normalizeStudioCodeForPath(studioCode)}/${PATH_SEG_ANALYTICS}`;
}

/** Single-sermon analytics inside the edit workspace (feat-0023). */
export function studioSermonAnalyticsPath(
    studioCode: string,
    sermonId: string,
): string {
    const id = sermonId.trim();
    return `${PATH_STUDIO_PREFIX}/${normalizeStudioCodeForPath(studioCode)}/sermons/${encodeURIComponent(id)}/analytics`;
}

// Get-started (global user KYC)
export const PATH_SEG_GET_STARTED_VERIFY_ACCOUNT = 'verify-account';
export const PATH_SEG_GET_STARTED_VERIFY_PERSONAL =
    'verify-account/personal-information';
export const PATH_SEG_GET_STARTED_VERIFY_DOCUMENT =
    'verify-account/verify-document';
export const PATH_SEG_GET_STARTED_VERIFY_DOC_SELECT =
    'verify-account/verify-document/select';
export const PATH_SEG_GET_STARTED_VERIFY_DOC_DOCUMENT1 =
    'verify-account/verify-document/document1';
export const PATH_SEG_GET_STARTED_VERIFY_DOC_UPLOAD =
    'verify-account/verify-document/upload';
export const PATH_SEG_GET_STARTED_HOME_ADDRESS = 'home-address';
export const PATH_SEG_GET_STARTED_MINISTRY = 'ministry-input';
export const PATH_SEG_GET_STARTED_TOUR = 'tour-guide';

// Admin platform (global — ADMIN + SUPER only)
export const PATH_ADMIN_PREFIX = '/admin';
export const PATH_SEG_ADMIN_USERS = 'users';
export const PATH_SEG_ADMIN_SERMONS = 'sermons';
export const PATH_SEG_ADMIN_SERMONS_BY_MINISTER =
    'sermons/minister/:ministerId';

// System / fallback / open (global)
export const PATH_PREVIEW = '/preview';
export const PATH_NO_NETWORK = '/no-network';
export const PATH_ROUTE_FALLBACK = '/route-fallback';
export const PATH_UNAUTHORIZED = '/unauthorized';
export const PATH_NOT_FOUND = '*';

/** Paths reachable without a session (auth forms + open/system). */
export const AUTH_PUBLIC_PATHS: readonly string[] = [
    PATH_LOGIN,
    PATH_REGISTER,
    PATH_ACTIVATE_ACCOUNT,
    PATH_VERIFY_OTP,
    PATH_FORGOT_PASSWORD,
    PATH_RESET_PASSWORD,
    PATH_PREVIEW,
    PATH_NO_NETWORK,
];

export function normalizePathname(pathname: string): string {
    return pathname.replace(/\/+$/, '') || '/';
}

export function isAuthPublicPath(pathname: string): boolean {
    const p = normalizePathname(pathname);
    if ((AUTH_PUBLIC_PATHS as readonly string[]).includes(p)) {
        return true;
    }
    return false;
}

/** Signed-in users on these paths are sent to their role home. */
export function isAuthEntryRedirectPath(pathname: string): boolean {
    const p = normalizePathname(pathname);
    return p === PATH_ROOT || p === PATH_LOGIN;
}

/**
 * LEGACY_DENIED — must never appear in appRoutes or navigate().
 * /activate, /peview, /dashboard, /sermons, /upload-sermon, /my-sermon,
 * /get-sermons, /sermon/:id, /admin/hackathons, /all-users, /talents, ...
 */
