import TrackPlayer from '@rntp/player';

import {
    usePlayerQueueStore,
    type LastPlayedSummary,
} from '@/engine/state/player-queue-store';
import type { SermonItemDTO, SermonTrackDTO } from '@/types/sermon';

function trackArtist(track: SermonTrackDTO): string {
    const item = track.item as SermonItemDTO | undefined;
    return track.artist ?? item?.minister ?? '';
}

function trackToSummary(
    track: SermonTrackDTO,
    positionSec: number,
): LastPlayedSummary {
    const id = track.item?.id ?? track.mediaId;
    const url =
        typeof track.url === 'string'
            ? track.url
            : typeof track.url === 'object' && track.url && 'uri' in track.url
            ? String((track.url as { uri: string }).uri)
            : '';

    const art =
        typeof track.artwork === 'string'
            ? track.artwork
            : typeof track.artworkUrl === 'string'
            ? track.artworkUrl
            : typeof track.item?.image === 'string'
            ? track.item.image
            : undefined;

    return {
        sermonId: id != null ? String(id) : '',
        title: track.title ?? track.item?.title ?? '',
        artist: trackArtist(track),
        artworkUrl: art,
        durationSec: typeof track.duration === 'number' ? track.duration : 0,
        lastPositionSec: Math.max(0, positionSec),
        streamUrl: url,
    };
}

/** Merge position/duration into persisted last-played without dropping stream URL. */
export function mergeLastPlayedPosition(
    positionSec: number,
    durationSec: number,
): void {
    const prev = usePlayerQueueStore.getState().lastPlayed;
    if (!prev?.sermonId) return;
    usePlayerQueueStore.getState().setLastPlayed({
        ...prev,
        lastPositionSec: Math.max(0, positionSec),
        durationSec: durationSec > 0 ? durationSec : prev.durationSec,
    });
}

/** Record full summary from the active engine track (e.g. after track change). */
export function recordLastPlayedFromTrack(
    track: SermonTrackDTO | undefined,
): void {
    if (!track) return;
    const { position, duration } = TrackPlayer.getProgress();
    const summary = trackToSummary(track, position || 0);
    if (duration > 0) summary.durationSec = duration;
    usePlayerQueueStore.getState().setLastPlayed(summary);
}

export function lastPlayedToSermonItemDto(
    lp: LastPlayedSummary,
): SermonItemDTO {
    return {
        id: lp.sermonId,
        title: lp.title,
        minister: lp.artist,
        image: lp.artworkUrl ?? null,
        url: lp.streamUrl || null,
        duration: lp.durationSec || null,
        sourceType: 'stream',
    };
}
