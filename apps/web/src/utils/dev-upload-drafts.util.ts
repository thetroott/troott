/**
 * In Vite dev, each completed **audio** upload is appended here so **My Drafts**
 * and **My Sermons** can list them without a working drafts/minister API.
 * Production is a no-op.
 */
const STORAGE_KEY = 'troott_dev_upload_drafts_v1';

export const DEV_UPLOAD_DRAFT_ID_PREFIX = 'dev-upload-';

export function isDevLocalUploadDraftId(id: string): boolean {
    return id.startsWith(DEV_UPLOAD_DRAFT_ID_PREFIX);
}

type DevDraftRow = {
    id: string;
    draftId: string;
    title: string;
    description: string;
    tags: string[];
    category: string;
    isPublic: boolean | undefined;
    createdAt: string;
    updatedAt: string;
    sermonId?: string;
    sourceFileName?: string;
    /** Length in whole seconds from browser metadata when available. */
    durationSec?: number;
};

function parseList(raw: string | null): DevDraftRow[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (row): row is DevDraftRow =>
                row &&
                typeof row === 'object' &&
                typeof (row as DevDraftRow).id === 'string' &&
                typeof (row as DevDraftRow).title === 'string',
        );
    } catch {
        return [];
    }
}

/** Serialized rows (newest first) for merging into draft context. */
export function readDevUploadDrafts(): DevDraftRow[] {
    if (!import.meta.env.DEV) return [];
    return parseList(localStorage.getItem(STORAGE_KEY));
}

function titleFromFileName(fileName: string): string {
    const base = fileName.replace(/\.[^.]+$/, '') || fileName;
    return base
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
}

/**
 * Call when sermon audio upload reaches 100% (mock or real API).
 */
export function recordDevUploadAfterAudioComplete(input: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    isPublic: boolean | undefined;
    sermonId?: string;
    sourceFileName: string;
    /** Whole seconds from browser audio metadata when available. */
    durationSec?: number;
}): void {
    if (!import.meta.env.DEV) return;

    const id = `${DEV_UPLOAD_DRAFT_ID_PREFIX}${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const row: DevDraftRow = {
        id,
        draftId: id,
        title:
            (input.title && input.title.trim()) ||
            titleFromFileName(input.sourceFileName),
        description: (input.description && input.description.trim()) || '',
        tags: Array.isArray(input.tags) ? input.tags : [],
        category: (input.category && input.category.trim()) || '',
        isPublic: input.isPublic,
        createdAt: now,
        updatedAt: now,
        sermonId: input.sermonId,
        sourceFileName: input.sourceFileName,
        durationSec: input.durationSec,
    };

    const list = parseList(localStorage.getItem(STORAGE_KEY));
    list.unshift(row);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function removeDevUploadDraft(id: string): void {
    if (!import.meta.env.DEV) return;
    if (!isDevLocalUploadDraftId(id)) return;
    const list = parseList(localStorage.getItem(STORAGE_KEY)).filter(
        (r) => r.id !== id,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Maps dev upload rows to API-shaped docs for {@link mapApiSermonToTableRow}.
 * Uses the draft row `id` as document id so each upload is a distinct My Sermons row.
 */
export function devUploadDraftRowsToMinisterListDocs(): Record<
    string,
    unknown
>[] {
    if (!import.meta.env.DEV) return [];
    return readDevUploadDrafts().map((row) => ({
        id: row.id,
        _id: row.id,
        title: row.title,
        createdAt: row.createdAt,
        status: 'draft',
        duration: typeof row.durationSec === 'number' ? row.durationSec : 0,
        playCount: 0,
        commentCount: 0,
        likeCount: 0,
        sermonId: row.sermonId,
        sourceFileName: row.sourceFileName,
    }));
}
