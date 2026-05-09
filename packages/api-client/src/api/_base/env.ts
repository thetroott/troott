import type { ChannelType } from './types';

/** Detect a sensible default channel when none was passed to `Troott`. */
export function detectDefaultChannel(): ChannelType {
    if (typeof navigator === 'undefined') return 'web';
    const ua = navigator.userAgent?.toLowerCase() ?? '';
    if (ua.includes('electron')) return 'desktop';
    if (ua.includes('expo') || ua.includes('react-native')) return 'mobile';
    return 'web';
}

export function normalizeApiBaseUrl(url: string): string {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (!trimmed) return url;
    if (/\/api\/v1$/i.test(trimmed)) return trimmed;
    if (/\/v1$/i.test(trimmed)) {
        return trimmed.replace(/\/v1$/i, '/api/v1');
    }
    return `${trimmed}/api/v1`;
}
