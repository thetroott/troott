import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';

/**
 * Normalizes catalog / mock rows (loader, FlashList items) into {@link SermonItemDTO}
 * so {@link loadQueue} can run through {@link mapDtoToTrack}.
 */
export function catalogRowToSermonItem(
    row: Partial<ISermonTrack> & { id: string | null },
): SermonItemDTO {
    const url = row.url ?? row.sermon ?? null;

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
    };
}
