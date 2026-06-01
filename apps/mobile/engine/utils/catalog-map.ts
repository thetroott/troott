import type { ISermonTrack, SermonItemDTO } from '@/api/dtos/sermon.dto';

/**
 * Normalizes catalog / mock rows (loader, FlashList items) into {@link SermonItemDTO}
 * so {@link loadQueue} can run through {@link mapDtoToTrack}.
 *
 * API-backed rows should set `url` via {@link sermonDocToCatalogRow} (canonical playback).
 * `row.url` here is for bundled fixtures only — not legacy API `sermonUrl` aliases.
 */
export function catalogRowToSermonItem(
    row: Partial<ISermonTrack> & { id: string | null },
): SermonItemDTO {
    const url = row.url ?? null;

    return {
        id: row.id,
        title: row.title ?? null,
        minister: row.minister ?? row.artist ?? null,
        duration: row.duration ?? null,
        image:
            typeof row.image === 'string' || typeof row.image === 'number'
                ? row.image
                : null,
        sourceType: row.sourceType ?? 'stream',
        url: typeof url === 'string' || typeof url === 'number' ? url : null,
        artwork:
            typeof row.artwork === 'string' || typeof row.artwork === 'number'
                ? row.artwork
                : typeof row.image === 'number'
                  ? row.image
                  : null,
        seriesId: row.seriesId ?? null,
        seriesTitle: row.seriesTitle ?? null,
        shareableUrl:
            typeof row.shareableUrl === 'string' ? row.shareableUrl : null,
    };
}
