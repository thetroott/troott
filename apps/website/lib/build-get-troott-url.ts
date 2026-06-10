import { getGetTroottBaseUrl } from './public-env';

import type { Platform } from './detect-platform';

export type DownloadPackage = 'android' | 'ios' | 'web' | 'dmg' | 'exe';

const PLATFORM_PACKAGE: Record<Platform, string | null> = {
    android: 'android',
    ios: 'ios',
    macos: 'dmg',
    windows: 'exe',
    unknown: null,
};

export function getTroottDownloadUrlByPackage(pkg: DownloadPackage): string {
    const base = getGetTroottBaseUrl();
    return `${base}?package=${pkg}`;
}

export function getTroottDownloadUrlForPlatform(platform: Platform): string {
    const base = getGetTroottBaseUrl();
    const pkg = PLATFORM_PACKAGE[platform];
    return pkg ? `${base}?package=${pkg}` : base;
}
