import storage from '@/api/services/local-storage';
import {
    PATH_GET_STARTED,
    PATH_PROFILE,
    PATH_SETTINGS,
    PATH_SEG_ANALYTICS,
    PATH_SEG_BIN,
    PATH_SEG_SERMONS,
    PATH_SEG_SERMONS_UPLOAD,
    PATH_SEG_SERMONS_UPLOAD_DETAILS,
    PATH_SEG_SERMONS_UPLOAD_FILE,
    PATH_SEG_SERMONS_UPLOAD_PUBLISH,
    PATH_SEG_SERMONS_UPLOAD_THUMBNAIL,
    PATH_STUDIO_PREFIX,
} from '@/routes/paths';

const ROUTE_STUDIO_CODE_RE = /^\/studio\/([^/]+)/i;

/** Web portal URLs always use lowercase studio public codes. */
export function normalizeStudioCode(code: string): string {
    return code.trim().toLowerCase();
}

/** Legacy Main nav keys resolved to `/studio/{code}/…` (feat-0004). */
const STUDIO_LEGACY_NAV_URLS = new Set([
    '/dashboard',
    '/sermons',
    '/analytics',
    '/bin',
    '/upload-sermon',
    '/upload-sermon/file',
    '/upload-sermon/details',
    '/upload-sermon/thumbnail',
    '/upload-sermon/publish',
]);

export function getStoredStudioCode(): string {
    const raw = storage.getStudioCode()?.trim() || '';
    return raw ? normalizeStudioCode(raw) : '';
}

export function parseRouteStudioCode(pathname: string): string {
    const match = pathname.match(ROUTE_STUDIO_CODE_RE);
    const raw = match?.[1]?.trim() ?? '';
    return raw ? normalizeStudioCode(raw) : '';
}

/** True for `/studio/{code}` with no further path segments. */
export function isStudioHomePath(pathname: string): boolean {
    const normalized = pathname.split('?')[0]?.replace(/\/+$/, '') || '/';
    if (!normalized.startsWith(`${PATH_STUDIO_PREFIX}/`)) {
        return false;
    }
    const rest = normalized.slice(`${PATH_STUDIO_PREFIX}/`.length);
    return rest.length > 0 && !rest.includes('/');
}

export function isPassthroughNavUrl(url: string): boolean {
    return (
        url === '#' ||
        url.startsWith(PATH_GET_STARTED) ||
        url.startsWith(PATH_PROFILE) ||
        url.startsWith(PATH_SETTINGS)
    );
}

export function isStudioScopedLegacyNavUrl(url: string): boolean {
    return STUDIO_LEGACY_NAV_URLS.has(url);
}

export type SidebarStudioCodeSources = {
    routeCode?: string;
    sessionCode?: string;
    contextCode?: string;
    storedCode?: string;
};

/** feat-0004 Behavior 3: URL param → session → studio context → storage. */
export function pickSidebarStudioCode(
    sources: SidebarStudioCodeSources,
): string {
    const candidates = [
        sources.routeCode,
        sources.sessionCode,
        sources.contextCode,
        sources.storedCode,
    ];
    for (const value of candidates) {
        const trimmed = value?.trim();
        if (trimmed) {
            return normalizeStudioCode(trimmed);
        }
    }
    return '';
}

function mapLegacyNavToStudioPath(url: string, code: string): string {
    const prefix = `${PATH_STUDIO_PREFIX}/${normalizeStudioCode(code)}`;

    switch (url) {
        case '/dashboard':
            return prefix;
        case '/sermons':
            return `${prefix}/${PATH_SEG_SERMONS}`;
        case '/analytics':
            return `${prefix}/${PATH_SEG_ANALYTICS}`;
        case '/bin':
            return `${prefix}/${PATH_SEG_BIN}`;
        case '/upload-sermon':
            return `${prefix}/${PATH_SEG_SERMONS}`;
        case '/upload-sermon/file':
            return `${prefix}/${PATH_SEG_SERMONS_UPLOAD_FILE}`;
        case '/upload-sermon/details':
            return `${prefix}/${PATH_SEG_SERMONS_UPLOAD_DETAILS}`;
        case '/upload-sermon/thumbnail':
            return `${prefix}/${PATH_SEG_SERMONS_UPLOAD_THUMBNAIL}`;
        case '/upload-sermon/publish':
            return `${prefix}/${PATH_SEG_SERMONS_UPLOAD_PUBLISH}`;
        default:
            return url;
    }
}

/**
 * Maps legacy Main nav URLs to studio-scoped paths.
 * Returns `null` when a studio-scoped item has no resolvable code (disabled link).
 */
export function resolveStudioNavUrl(
    url: string,
    studioCode?: string,
): string | null {
    if (isPassthroughNavUrl(url)) {
        return url;
    }

    if (!isStudioScopedLegacyNavUrl(url)) {
        return url;
    }

    const code = studioCode?.trim() ? normalizeStudioCode(studioCode) : '';
    if (!code) {
        return null;
    }

    return mapLegacyNavToStudioPath(url, code);
}

/** @deprecated Use resolveStudioNavUrl(url, code) — storage-only fallback for non-React callers. */
export function resolveStudioNavUrlFromStorage(url: string): string | null {
    return resolveStudioNavUrl(url, getStoredStudioCode());
}
