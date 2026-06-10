/**
 * NEXT_PUBLIC_* values inlined at build time.
 * In development, local defaults apply when a var is unset so get-troott links never degrade to `?package=…`.
 */
const DEV_DEFAULTS = {
    siteUrl: 'http://localhost:3051',
    webAppUrl: 'http://localhost:5053',
    getTroottPath: '/get-troott',
} as const;

function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

function readPublicEnv(key: string, devDefault = ''): string {
    const value = process.env[key]?.trim() ?? '';
    if (value) return value;
    if (isDevelopment()) return devDefault;
    return '';
}

function readGetTroottEnabled(): boolean {
    const raw = process.env.NEXT_PUBLIC_GET_TROOTT_ENABLED?.trim();
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return isDevelopment();
}

export const publicEnv = {
    siteUrl: readPublicEnv('NEXT_PUBLIC_SITE_URL', DEV_DEFAULTS.siteUrl),
    webAppUrl: readPublicEnv('NEXT_PUBLIC_WEB_APP_URL', DEV_DEFAULTS.webAppUrl),
    getTroottPath: readPublicEnv(
        'NEXT_PUBLIC_GET_TROOTT_PATH',
        DEV_DEFAULTS.getTroottPath,
    ),
    getTroottEnabled: readGetTroottEnabled(),
    requestDemoUrl: readPublicEnv('NEXT_PUBLIC_REQUEST_DEMO_URL'),
};

export function joinUrl(base: string, path: string): string {
    const normalizedBase = base.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
}

export function getGetTroottBaseUrl(): string {
    const { webAppUrl, getTroottPath } = publicEnv;
    if (!webAppUrl) return '';
    return joinUrl(webAppUrl, getTroottPath || DEV_DEFAULTS.getTroottPath);
}
