import type { ChoosePlaylistListItem } from '@/components/features/playlist/playlist-choose-types';

/** Normalizes various playlist list API envelopes to an array of plain rows. */
export function normalizePlaylistDocuments(raw: unknown): unknown[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object' && raw !== null && 'items' in raw) {
        const items = (raw as { items: unknown }).items;
        return Array.isArray(items) ? items : [];
    }
    return [];
}

function readString(obj: Record<string, unknown>, keys: string[]): string | null {
    for (const k of keys) {
        const v = obj[k];
        if (typeof v === 'string' && v.trim().length > 0) return v;
    }
    return null;
}

/**
 * Maps GET `/playlists` (or similar) payload rows into choose-list rows for add-sermon flows.
 * Skips entries missing id or title.
 */
export function mapPlaylistDocsToChooseItems(raw: unknown): ChoosePlaylistListItem[] {
    const docs = normalizePlaylistDocuments(raw);
    const out: ChoosePlaylistListItem[] = [];

    for (const row of docs) {
        if (row == null || typeof row !== 'object') continue;
        const o = row as Record<string, unknown>;
        const id = readString(o, ['_id', 'id']);
        const title = readString(o, ['title', 'name']);
        const playlistTypeRaw = readString(o, ['playlistType', 'playlist_type']);
        if (!id || !title) continue;

        out.push({
            id,
            title,
            playlistType: playlistTypeRaw ?? undefined,
        });
    }

    return out;
}
