import type { ISermonTrack } from '@/types/sermon';
import type { SermonItemDTO } from '@/types/sermon';
import { queryClient } from '@/services/query-client';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import { tracks as mockTracks } from '@/_data/_mock/tracks';

const SERMONS_QUERY_KEY = ['sermons'] as const;

function normalizeMinisterName(s: string | null | undefined): string {
    return (s ?? '').trim().toLowerCase();
}

/**
 * Cached React Query catalog, or mock tracks — same sources as home / {@link useSermonsCatalog}.
 */
export function getAutoplayCatalogAsSermonItems(): SermonItemDTO[] {
    const cached = queryClient.getQueryData<ISermonTrack[]>(SERMONS_QUERY_KEY);
    if (cached && cached.length > 0) {
        return cached.map((r) =>
            catalogRowToSermonItem({ ...r, id: r.id ?? null }),
        );
    }
    return mockTracks.map((r) =>
        catalogRowToSermonItem({ ...r, id: r.id ?? null }),
    );
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
