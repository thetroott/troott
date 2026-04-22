import TrackPlayer from '@rntp/player';

/** v5 has no `removeUpcomingTracks`; drop everything after the active index. */
export function removeUpcomingMediaItems(): void {
    const idx = TrackPlayer.getActiveMediaItemIndex();
    const q = TrackPlayer.getQueue();
    if (idx === null || q.length <= idx + 1) return;
    TrackPlayer.removeMediaItems(idx + 1, q.length);
}
