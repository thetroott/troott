import { formatUploadPipelineLabel } from '@/utils/upload-pipeline-label.util';
import { pickSermonDurationSeconds } from '@/utils/sermon-list-map.util';
import {
    normalizeSermonVisibility,
    visibilityLabel,
} from '@/utils/sermon-visibility.util';

export type SermonGetInfoContext = 'library' | 'bin';

export type SermonInfoRow = {
    label: string;
    value: string;
    /** When set, row shows a copy control for this string. */
    copyText?: string;
    multiline?: boolean;
};

export type SermonInfoViewModel = {
    title: string;
    rows: SermonInfoRow[];
    /** Shown under Location when context is bin. */
    binLocationHint?: string;
};

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

function formatDateTime(value: unknown): string | null {
    if (value instanceof Date) {
        return value.toLocaleString();
    }
    if (typeof value === 'string' && value.trim()) {
        const t = Date.parse(value);
        if (Number.isFinite(t)) {
            return new Date(t).toLocaleString();
        }
    }
    return null;
}

function formatDateOnly(value: unknown): string | null {
    if (value instanceof Date) {
        return value.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
    if (typeof value === 'string' && value.trim()) {
        const t = Date.parse(value);
        if (Number.isFinite(t)) {
            return new Date(t).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    }
    return null;
}

/** Same draft detection as `mapApiSermonToTableRow`. */
export function isSermonDraftDocument(
    doc: Record<string, unknown>,
): boolean {
    const statusRaw = String(doc.status ?? doc.state ?? '').toLowerCase();
    return (
        statusRaw.includes('draft') ||
        statusRaw === 'unpublished' ||
        statusRaw === 'inactive'
    );
}

export function resolveStudioSermonShareLink(
    doc: Record<string, unknown>,
    sermonId: string,
): string {
    const apiUrl =
        typeof doc.shareableUrl === 'string' ? doc.shareableUrl.trim() : '';
    if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
        return apiUrl;
    }
    const id = String(doc.id ?? doc._id ?? sermonId);
    return `${window.location.origin}/sermon/${id}`;
}

function pushRow(
    rows: SermonInfoRow[],
    label: string,
    value: string | null | undefined,
    opts?: { copyText?: string; multiline?: boolean },
) {
    const v = value?.trim() ?? '';
    if (!v && !opts?.copyText) {
        return;
    }
    rows.push({
        label,
        value: v || '—',
        copyText: opts?.copyText,
        multiline: opts?.multiline,
    });
}

export function mapSermonDetailToInfoView(
    doc: Record<string, unknown>,
    context: SermonGetInfoContext,
    fallbackSermonId: string,
): SermonInfoViewModel {
    const title = (doc.title as string)?.trim() || 'Untitled sermon';
    const rows: SermonInfoRow[] = [];
    const draft = isSermonDraftDocument(doc);

    const description = (doc.description as string)?.trim();
    if (description) {
        pushRow(rows, 'Description', description, { multiline: true });
    }

    if (context === 'bin') {
        pushRow(rows, 'Location', 'In bin');
        pushRow(
            rows,
            'Library status',
            draft ? 'Was draft' : 'Was published',
        );
    } else {
        pushRow(rows, 'Publication', draft ? 'Draft' : 'Published');
        const visibility = normalizeSermonVisibility(
            doc.visibility,
            doc.isPublic as boolean | undefined,
        );
        pushRow(rows, 'Visibility', visibilityLabel(visibility));
    }

    const durationSec = pickSermonDurationSeconds(doc);
    pushRow(rows, 'Duration', formatSecondsToLabel(durationSec));

    const item = doc.item as Record<string, unknown> | undefined;
    const uploadStatus =
        item && typeof item.uploadStatus === 'string'
            ? item.uploadStatus
            : undefined;
    const processingLabel = formatUploadPipelineLabel(uploadStatus);
    if (processingLabel) {
        pushRow(rows, 'Processing', processingLabel);
    }

    const created = formatDateTime(doc.createdAt);
    if (created) {
        pushRow(rows, 'Date created', created);
    }

    const updated = formatDateTime(doc.updatedAt);
    if (updated) {
        pushRow(rows, 'Last updated', updated);
    }

    const release = formatDateOnly(doc.releaseDate);
    if (release) {
        pushRow(rows, 'Release date', release);
    }

    const published = formatDateTime(doc.publishedAt);
    if (published) {
        pushRow(rows, 'Published', published);
    }

    if (typeof doc.playCount === 'number') {
        pushRow(rows, 'Plays', String(doc.playCount));
    }

    if (typeof doc.likeCount === 'number') {
        pushRow(rows, 'Likes', String(doc.likeCount));
    }

    if (typeof doc.commentCount === 'number') {
        pushRow(rows, 'Comments', String(doc.commentCount));
    }

    const sermonId = String(doc.id ?? doc._id ?? fallbackSermonId);
    pushRow(rows, 'Sermon ID', sermonId, { copyText: sermonId });

    const itemId =
        item && typeof item.itemId === 'string' ? item.itemId.trim() : '';
    if (itemId) {
        pushRow(rows, 'Upload reference', itemId, { copyText: itemId });
    }

    const shareLink = resolveStudioSermonShareLink(doc, sermonId);
    pushRow(rows, 'Share link', shareLink, { copyText: shareLink });

    return {
        title,
        rows,
        binLocationHint:
            context === 'bin'
                ? 'Not in your sermon library until restored.'
                : undefined,
    };
}

export function isSermonDetailNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }
    if ('response' in error) {
        const status = (error as { response?: { status?: number } }).response
            ?.status;
        if (status === 404) {
            return true;
        }
    }
    const msg =
        'message' in error
            ? String((error as { message: unknown }).message).toLowerCase()
            : '';
    return msg.includes('404') || msg.includes('not found');
}
