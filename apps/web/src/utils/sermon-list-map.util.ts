import type { Sermon } from '@/_data/dummySermons';
import type { AxiosResponse } from 'axios';

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
export function pickSermonDurationSeconds(raw: Record<string, unknown>): number {
  const uploadSummary = raw.uploadSummary as Record<string, unknown> | undefined;
  const meta =
    uploadSummary &&
    typeof uploadSummary.metadata === 'object' &&
    uploadSummary.metadata !== null
      ? (uploadSummary.metadata as Record<string, unknown>)
      : undefined;

  return coalesceDurationSeconds(
    raw.duration,
    meta?.duration,
    raw.audioDuration,
  );
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
  const updatedAtMs =
    dateFieldToMs(raw.updatedAt) ?? createdAtMs;
  const releaseDateMs =
    dateFieldToMs(raw.releaseDate) ?? createdAtMs;

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
  res: AxiosResponse<{ data?: unknown }>,
): { list: Record<string, unknown>[]; total: number } {
  const raw = res.data?.data;
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
