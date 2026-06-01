import type { ISermonTrack } from '@/api/dtos/sermon.dto';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import { queryClient } from '@/api/services/query-client';
import { queryKeys } from '@/api/query-keys';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import { sermonDocToCatalogRow } from '@/engine/utils/library-map';

function normalizeMinisterName(s: string | null | undefined): string {
    return (s ?? '').trim().toLowerCase();
}

/**
 * Cached discovery home catalog — same source as {@link useDiscoveryHomeRails}.
 */
export function getAutoplayCatalogAsSermonItems(): SermonItemDTO[] {
    const home = queryClient.getQueryData(queryKeys.discovery.home());
    if (home == null || typeof home !== 'object') {
        return [];
    }

    const root = home as Record<string, unknown>;
    const docGroups = [
        root.popularRecentlyPlayed,
        root.recentlyPublished,
        root.mostPlayed,
    ];

    const items: SermonItemDTO[] = [];
    const seen = new Set<string>();

    for (const group of docGroups) {
        if (!Array.isArray(group)) continue;
        for (const doc of group) {
            const row = sermonDocToCatalogRow(doc);
            if (!row?.id || seen.has(row.id)) continue;
            seen.add(row.id);
            items.push(catalogRowToSermonItem(row));
        }
    }

    return items;
}

/**
 * Merges `base` with items from `tailSource` (excluding duplicates) until at least `minItems`
 * rows exist. Optionally prioritizes the same minister / artist string.
 */
export function mergeAutoplayTail(
    base: SermonItemDTO[],
    tailSource: SermonItemDTO[],
    options?: { preferMinister?: string | null; minItems?: number },
): SermonItemDTO[] {
    const minItems = options?.minItems ?? 2;
    if (base.length >= minItems) return base;

    const seen = new Set<string>();
    for (const t of base) {
        if (t.id) seen.add(String(t.id));
    }

    const prefer = normalizeMinisterName(options?.preferMinister);
    const candidates = tailSource.filter(
        (t) => t.id && !seen.has(String(t.id)),
    );

    let ordered: SermonItemDTO[] = [];
    if (prefer) {
        const match = candidates.filter((t) => {
            const m = normalizeMinisterName(t.minister);
            const a = normalizeMinisterName((t as ISermonTrack).artist);
            return m === prefer || a === prefer;
        });
        const rest = candidates.filter((t) => !match.includes(t));
        ordered = [...match, ...rest];
    } else {
        ordered = candidates;
    }

    const merged = [...base];
    for (const t of ordered) {
        if (merged.length >= minItems) break;
        merged.push(t);
        if (t.id) seen.add(String(t.id));
    }

    return merged;
}
