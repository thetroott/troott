import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';

function rowSearchHaystack(r: Partial<ISermonTrack>): string[] {
    const tags = Array.isArray(r.tags) ? r.tags : [];
    return [
        r.title,
        r.minister,
        r.artist,
        r.topic,
        r.description,
        ...tags,
    ].filter((s): s is string => s != null && String(s).length > 0);
}

/**
 * Client-side slice of the bundled/home catalog (sermon.json + loader), case-insensitive.
 */
export function filterBundledCatalogByQuery(
    rows: ISermonTrack[],
    q: string,
): SermonItemDTO[] {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];

    const out: SermonItemDTO[] = [];
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const hit = rowSearchHaystack(r).some((part) =>
            part.toLowerCase().includes(needle),
        );
        if (!hit) continue;
        out.push(
            catalogRowToSermonItem({
                ...r,
                id: r.id != null ? String(r.id) : `bundled-${i}`,
            }),
        );
    }
    return out;
}

/** API hits first; append bundled rows not already present (by id). */
export function mergeSermonSearchResults(
    apiSermons: SermonItemDTO[],
    bundledSermons: SermonItemDTO[],
): SermonItemDTO[] {
    const seen = new Set<string>();
    const merged: SermonItemDTO[] = [];

    for (const s of apiSermons) {
        const id = s.id != null ? String(s.id) : '';
        if (id) seen.add(id);
        merged.push(s);
    }
    for (const s of bundledSermons) {
        const id = s.id != null ? String(s.id) : '';
        if (id && seen.has(id)) continue;
        if (id) seen.add(id);
        merged.push(s);
    }
    return merged;
}
