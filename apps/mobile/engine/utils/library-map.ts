import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';

import { catalogRowToSermonItem } from './catalog-map';

/** Accepts API sermon docs (populated or lean). */
export function sermonDocToCatalogRow(
    doc: unknown,
): (Partial<ISermonTrack> & { id: string | null }) | null {
    if (doc == null || typeof doc !== 'object') return null;
    const d = doc as Record<string, unknown>;
    const rawId = d._id ?? d.id;
    const id = rawId != null ? String(rawId) : null;

    let ministerName: string | null = null;
    if (d.minister != null && typeof d.minister === 'object') {
        const m = d.minister as Record<string, unknown>;
        const fn = m.firstName != null ? String(m.firstName) : '';
        const ln = m.lastName != null ? String(m.lastName) : '';
        ministerName = `${fn} ${ln}`.trim() || null;
    } else if (typeof d.minister === 'string') {
        ministerName = d.minister;
    }

    const title = d.title != null ? String(d.title) : null;
    const image =
        typeof d.imageUrl === 'string'
            ? d.imageUrl
            : typeof d.coverArt === 'string'
              ? d.coverArt
              : typeof d.image === 'string'
                ? d.image
                : null;

    const sermonUrl =
        typeof d.sermonUrl === 'string'
            ? d.sermonUrl
            : typeof d.url === 'string'
              ? d.url
              : null;

    let seriesId: string | null = null;
    let seriesTitle: string | null = null;
    if (d.series != null && typeof d.series === 'object') {
        const s = d.series as Record<string, unknown>;
        const sid = s._id ?? s.id;
        if (sid != null) seriesId = String(sid);
        if (typeof s.title === 'string') seriesTitle = s.title;
    }

    return {
        id,
        title,
        minister: ministerName,
        image,
        url: sermonUrl,
        duration: typeof d.duration === 'number' ? d.duration : null,
        sourceType: 'stream',
        seriesId,
        seriesTitle,
    };
}

export function mapSermonDocsToItems(docs: unknown): SermonItemDTO[] {
    if (!Array.isArray(docs)) return [];
    const out: SermonItemDTO[] = [];
    for (const doc of docs) {
        const row = sermonDocToCatalogRow(doc);
        if (row?.id) {
            out.push(catalogRowToSermonItem(row));
        }
    }
    return out;
}

export function getLibraryArrayField(
    lib: unknown,
    camel: string,
    lowerAlt?: string,
): unknown[] {
    if (lib == null || typeof lib !== 'object') return [];
    const o = lib as Record<string, unknown>;
    const v = o[camel] ?? (lowerAlt ? o[lowerAlt] : undefined);
    return Array.isArray(v) ? v : [];
}

export function ministerDocToRow(doc: unknown): {
    id: string;
    name: string;
    image?: string;
} | null {
    if (doc == null || typeof doc !== 'object') return null;
    const d = doc as Record<string, unknown>;
    const rawId = d._id ?? d.id;
    if (rawId == null) return null;
    const id = String(rawId);
    const fn = d.firstName != null ? String(d.firstName) : '';
    const ln = d.lastName != null ? String(d.lastName) : '';
    const name = `${fn} ${ln}`.trim();
    const image =
        typeof d.avatar === 'string'
            ? d.avatar
            : typeof d.imageUrl === 'string'
              ? d.imageUrl
              : typeof d.profileImage === 'string'
                ? d.profileImage
                : undefined;
    return { id, name: name || 'Minister', ...(image ? { image } : {}) };
}

function parseTimestampMs(value: unknown): number | undefined {
    if (value == null) return undefined;
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value < 1e12 ? Math.round(value * 1000) : Math.round(value);
    }
    if (typeof value === 'string') {
        const t = Date.parse(value);
        return Number.isNaN(t) ? undefined : t;
    }
    return undefined;
}

/** Duration: seconds number, or string like "1:32:51" / "45:12". */
export function parseFlexibleDurationSeconds(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        return Math.floor(value);
    }
    if (typeof value !== 'string') return null;
    const parts = value.split(':').map((p) => Number(p.trim()));
    if (parts.some((p) => Number.isNaN(p))) return null;
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return null;
}

/** Series items saved on the user library (`followedSeries` when API adds it). */
export function seriesDocToLibraryRow(doc: unknown): {
    id: string;
    title: string;
    image?: string;
    minister?: string;
    durationSeconds?: number | null;
    totalPlays?: number | null;
    updatedAtMs?: number;
    createdAtMs?: number;
} | null {
    if (doc == null || typeof doc !== 'object') return null;
    const d = doc as Record<string, unknown>;
    const rawId = d._id ?? d.id;
    if (rawId == null) return null;
    let ministerName: string | undefined;
    if (d.minister != null && typeof d.minister === 'object') {
        const m = d.minister as Record<string, unknown>;
        const fn = m.firstName != null ? String(m.firstName) : '';
        const ln = m.lastName != null ? String(m.lastName) : '';
        ministerName = `${fn} ${ln}`.trim() || undefined;
    } else if (typeof d.minister === 'string') {
        ministerName = d.minister;
    }
    const title =
        d.title != null
            ? String(d.title)
            : d.name != null
              ? String(d.name)
              : 'Series';
    const image =
        typeof d.imageUrl === 'string'
            ? d.imageUrl
            : typeof d.coverArt === 'string'
              ? d.coverArt
              : typeof d.image === 'string'
                ? d.image
                : typeof d.cover === 'string'
                  ? d.cover
                  : undefined;
    const durationSeconds =
        parseFlexibleDurationSeconds(d.duration) ??
        parseFlexibleDurationSeconds(d.totalDuration);
    const totalPlays =
        typeof d.totalPlays === 'number' ? d.totalPlays : undefined;
    return {
        id: String(rawId),
        title,
        ...(ministerName ? { minister: ministerName } : {}),
        ...(image ? { image } : {}),
        durationSeconds:
            durationSeconds != null && durationSeconds >= 0
                ? durationSeconds
                : null,
        ...(totalPlays != null ? { totalPlays } : {}),
        updatedAtMs: parseTimestampMs(d.updatedAt ?? d.updated_at),
        createdAtMs: parseTimestampMs(d.createdAt ?? d.created_at),
    };
}

export type LibrarySeriesRow = NonNullable<
    ReturnType<typeof seriesDocToLibraryRow>
>;

export function mapSeriesDocsToRows(docs: unknown): LibrarySeriesRow[] {
    if (!Array.isArray(docs)) return [];
    const out: LibrarySeriesRow[] = [];
    for (const doc of docs) {
        const row = seriesDocToLibraryRow(doc);
        if (row) out.push(row);
    }
    return out;
}

export function playlistDocToRow(doc: unknown): {
    id: string;
    title: string;
    description?: string;
    image?: string;
} | null {
    if (doc == null || typeof doc !== 'object') return null;
    const d = doc as Record<string, unknown>;
    const rawId = d._id ?? d.id;
    if (rawId == null) return null;
    return {
        id: String(rawId),
        title:
            d.title != null
                ? String(d.title)
                : d.name != null
                  ? String(d.name)
                  : 'Playlist',
        description:
            typeof d.description === 'string' ? d.description : undefined,
        image:
            typeof d.image === 'string'
                ? d.image
                : typeof d.coverImage === 'string'
                  ? d.coverImage
                  : typeof d.imageUrl === 'string'
                    ? d.imageUrl
                    : undefined,
    };
}
