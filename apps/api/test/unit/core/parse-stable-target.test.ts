import { describe, it, expect } from '@jest/globals';

/** Mirrors `apps/mobile/lib/deep-link/parse-stable-target.ts` regex contract for CI. */
function parseStableTargetFromUrl(url: string) {
    if (!url || typeof url !== 'string') {
        return null;
    }
    const sermon = url.match(/\/sermons?\/([^/?#]+)/i);
    if (sermon?.[1]) {
        return { kind: 'sermon' as const, id: decodeURIComponent(sermon[1]) };
    }
    const playlist = url.match(/\/playlists?\/([^/?#]+)/i);
    if (playlist?.[1]) {
        return { kind: 'playlist' as const, id: decodeURIComponent(playlist[1]) };
    }
    const minister = url.match(/\/ministers?\/([^/?#]+)/i);
    if (minister?.[1]) {
        return { kind: 'minister' as const, id: decodeURIComponent(minister[1]) };
    }
    return null;
}

describe('parseStableTargetFromUrl (contract)', () => {
    it('parses https singular sermon path', () => {
        expect(
            parseStableTargetFromUrl(
                'https://listen.example/sermon/507f1f77bcf86cd799439011',
            ),
        ).toEqual({
            kind: 'sermon',
            id: '507f1f77bcf86cd799439011',
        });
    });

    it('parses plural sermons path', () => {
        expect(
            parseStableTargetFromUrl(
                'https://listen.example/sermons/my-sermon-slug',
            ),
        ).toEqual({ kind: 'sermon', id: 'my-sermon-slug' });
    });

    it('parses custom scheme', () => {
        expect(
            parseStableTargetFromUrl(
                'troottmobile://sermon/507f1f77bcf86cd799439011',
            ),
        ).toEqual({
            kind: 'sermon',
            id: '507f1f77bcf86cd799439011',
        });
    });

    it('parses playlist', () => {
        expect(
            parseStableTargetFromUrl('https://x.test/playlist/abc'),
        ).toEqual({ kind: 'playlist', id: 'abc' });
    });

    it('parses minister with query string', () => {
        expect(
            parseStableTargetFromUrl(
                'https://x.test/minister/slug-1?utm_source=share',
            ),
        ).toEqual({ kind: 'minister', id: 'slug-1' });
    });

    it('parses plural playlists path', () => {
        expect(
            parseStableTargetFromUrl('https://x.test/playlists/xyz'),
        ).toEqual({ kind: 'playlist', id: 'xyz' });
    });
});
