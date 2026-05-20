import { genSlug, generateRandomChars } from '@/utils/helpers.util';

/** Reserved studio slugs — extend when new top-level API segments are added. */
export const STUDIO_RESERVED_SLUGS = new Set(
    [
        'admin',
        'api',
        'v1',
        'studios',
        'studio',
        'settings',
        'help',
        'login',
        'register',
        'oauth',
        'webhook',
        'open',
        'share',
        'static',
        'assets',
        'health',
        'me',
        'new',
        'edit',
        'search',
        'discover',
        'user',
        'users',
        'minister',
        'ministers',
        'creator',
        'creators',
        'listener',
        'listeners',
        'playlist',
        'playlists',
        'sermon',
        'sermons',
        'series',
        'playback',
        'plans',
        'subscriptions',
        'invitation',
        'invitations',
        'null',
        'undefined',
    ].map((s) => s.toLowerCase()),
);

export function normalizeStudioSlug(raw: string): string {
    return genSlug(raw.trim()).toLowerCase();
}

export function isReservedStudioSlug(slug: string): boolean {
    return STUDIO_RESERVED_SLUGS.has(slug.toLowerCase());
}

/** Public studio code: uppercase alphanumeric, globally unique. */
export function generateStudioCode(): string {
    const raw = generateRandomChars(12).replace(/[^a-zA-Z0-9]/g, '');
    return (raw || generateRandomChars(12)).toUpperCase().slice(0, 12);
}
