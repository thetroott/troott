import type { SermonTrackDTO } from '@/api/dtos/sermon.dto';

/**
 * `@rntp/player` can error if a require() id or empty `url` reaches the native
 * side. Unresolved `number` `url` values (bundled id) are not playable until
 * {@link resolvePlaybackUrisForTrackPlayer} has produced a string URI.
 */
export function isPlayableTrackForPlayer(track: SermonTrackDTO): boolean {
    const { url } = track;
    if (url == null) return false;
    if (typeof url === 'string') return url.length > 0;
    if (typeof url === 'number') return false;
    if (typeof url === 'object' && 'uri' in (url as object)) {
        const u = (url as { uri: unknown }).uri;
        return typeof u === 'string' && u.length > 0;
    }
    return false;
}

/**
 * After {@link resolvePlaybackUrisForTrackPlayer} and filtering to playable
 * items, recompute the active index to match the same track id as before
 * (when possible).
 */
export function resolvePlayableStartIndex(
    restoredQueue: SermonTrackDTO[],
    storedIndex: number,
    playable: SermonTrackDTO[],
): number {
    if (playable.length === 0) return 0;
    const safeIdx = Math.max(
        0,
        Math.min(storedIndex, Math.max(0, restoredQueue.length - 1)),
    );
    const anchor = restoredQueue[safeIdx];
    const anchorId = anchor
        ? String(anchor.item?.id ?? anchor.mediaId ?? '')
        : '';
    if (anchorId) {
        const j = playable.findIndex(
            (t) => String(t.item?.id ?? t.mediaId) === anchorId,
        );
        if (j >= 0) return j;
    }
    return Math.min(safeIdx, playable.length - 1);
}
