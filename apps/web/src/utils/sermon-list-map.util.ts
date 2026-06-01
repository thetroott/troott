import type { Sermon } from '@/_data/dummySermons';
import type { IAPIResponse } from '@/api/types';
import type { AxiosResponse } from 'axios';

/** Canonical audio URL from API sermon document (`playbackUrl` / `manifestUrl` / `item.item`). */
export function resolveSermonPlaybackUrl(
    raw: Record<string, unknown> | null | undefined,
): string | null {
    if (!raw) return null;
    if (typeof raw.playbackUrl === 'string' && raw.playbackUrl.trim()) {
        return raw.playbackUrl.trim();
    }
    if (typeof raw.manifestUrl === 'string' && raw.manifestUrl.trim()) {
        return raw.manifestUrl.trim();
    }
    const item = raw.item as Record<string, unknown> | undefined;
    if (item && typeof item.item === 'string' && item.item.trim()) {
        return item.item.trim();
    }
    return null;
}

function coalesceDurationSeconds(...candidates: unknown[]): number {
    for (const v of candidates) {
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
            return Math.floor(v);
        }
        if (typeof v === 'string' && v.trim()) {
            const n = Number.parseFloat(v);
            if (Number.isFinite(n) && n > 0) {
                return Math.floor(n);
            }
        }
    }
    return 0;
}

/** Resolve stored length in seconds from API / Mongoose sermon documents. */
export function pickSermonDurationSeconds(
    raw: Record<string, unknown>,
): number {
    const item = raw.item as Record<string, unknown> | undefined;

    return coalesceDurationSeconds(raw.duration, item?.duration);
}

/**
 * Deterministic “random” length for dev when the API has no duration yet.
 * Same `id` always maps to the same value (no flicker on refetch).
 */
function stableDevPlaceholderDurationSec(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i += 1) {
        h = (h * 31 + seed.charCodeAt(i)) | 0;
    }
    const minSec = 3 * 60;
    const maxSec = 55 * 60;
    const span = maxSec - minSec + 1;
    return minSec + (Math.abs(h) % span);
}

function dateFieldToMs(v: unknown): number | undefined {
    if (v instanceof Date) return v.getTime();
    if (typeof v === 'string' && v.trim()) {
        const t = Date.parse(v);
        return Number.isFinite(t) ? t : undefined;
    }
    return undefined;
}

/** Map API sermon document (mongoose / DTO) to My Sermons table row shape. */
export function mapApiSermonToTableRow(raw: Record<string, unknown>): Sermon {
    const id = String(raw.id ?? raw._id ?? '');
    const title = (raw.title as string) || 'Untitled';
    let durationSec = pickSermonDurationSeconds(raw);
    if (
        import.meta.env.DEV &&
        (!durationSec || Number.isNaN(durationSec)) &&
        id
    ) {
        durationSec = stableDevPlaceholderDurationSec(id);
    }

    const created =
        (raw.releaseDate as string) ||
        (raw.createdAt as string) ||
        (raw.updatedAt as string) ||
        '';
    const dateLabel = created
        ? new Date(created).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : '—';

    const statusRaw = String(raw.status ?? raw.state ?? '').toLowerCase();
    const isDraft =
        statusRaw.includes('draft') ||
        statusRaw === 'unpublished' ||
        statusRaw === 'inactive';

    const plays =
        typeof raw.playCount === 'number'
            ? raw.playCount
            : Array.isArray(raw.playHistory)
              ? raw.playHistory.length
              : 0;

    const createdAtMs = dateFieldToMs(raw.createdAt);
    const updatedAtMs = dateFieldToMs(raw.updatedAt) ?? createdAtMs;
    const releaseDateMs = dateFieldToMs(raw.releaseDate) ?? createdAtMs;

    return {
        id,
        name: title,
        duration: formatSecondsToLabel(durationSec),
        dateCreated: dateLabel,
        createdAtMs,
        updatedAtMs,
        releaseDateMs,
        plays,
        comments: typeof raw.commentCount === 'number' ? raw.commentCount : 0,
        likes: typeof raw.likeCount === 'number' ? raw.likeCount : 0,
        dislikes: 0,
        type: 'audio',
        publicationStatus: isDraft ? 'draft' : 'published',
    };
}

/** Normalizes GET /sermon/minister/:id — supports `{ sermons, total }` or legacy array. */
export function parseMinisterSermonsResponse(
    res: AxiosResponse<{ data?: unknown }> | IAPIResponse,
): { list: Record<string, unknown>[]; total: number } {
    let raw: unknown;

    if (res && typeof res === 'object' && 'error' in res && !('config' in res)) {
        raw = (res as IAPIResponse).data;
    } else {
        const ax = res as AxiosResponse<{ data?: unknown }>;
        const body = ax.data;
        if (body && typeof body === 'object' && 'error' in body) {
            raw = (body as IAPIResponse).data;
        } else {
            raw =
                body && typeof body === 'object' && body !== null && 'data' in body
                    ? (body as { data?: unknown }).data
                    : body;
        }
    }
    if (Array.isArray(raw)) {
        return { list: raw as Record<string, unknown>[], total: raw.length };
    }
    if (
        raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { sermons?: unknown }).sermons)
    ) {
        const o = raw as { sermons: Record<string, unknown>[]; total?: number };
        const list = o.sermons;
        const total =
            typeof o.total === 'number' && Number.isFinite(o.total)
                ? o.total
                : list.length;
        return { list, total };
    }
    return { list: [], total: 0 };
}

function formatSecondsToLabel(totalSeconds: number): string {
    if (!totalSeconds || Number.isNaN(totalSeconds)) return '—';
    const s = Math.floor(totalSeconds % 60);
    const totalM = Math.floor(totalSeconds / 60);
    const h = Math.floor(totalM / 60);
    const m = totalM % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
}
