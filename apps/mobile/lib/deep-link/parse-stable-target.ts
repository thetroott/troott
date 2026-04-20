export type PendingStableTarget =
    | { kind: 'sermon'; id: string }
    | { kind: 'playlist'; id: string }
    | { kind: 'minister'; id: string };

/**
 * Extract stable resource target from a cold-start or runtime URL (https universal link or custom scheme).
 */
export function parseStableTargetFromUrl(url: string): PendingStableTarget | null {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const sermon = url.match(/\/sermons?\/([^/?#]+)/i);
    if (sermon?.[1]) {
        return { kind: 'sermon', id: decodeURIComponent(sermon[1]) };
    }

    const playlist = url.match(/\/playlists?\/([^/?#]+)/i);
    if (playlist?.[1]) {
        return { kind: 'playlist', id: decodeURIComponent(playlist[1]) };
    }

    const minister = url.match(/\/ministers?\/([^/?#]+)/i);
    if (minister?.[1]) {
        return { kind: 'minister', id: decodeURIComponent(minister[1]) };
    }

    return null;
}
