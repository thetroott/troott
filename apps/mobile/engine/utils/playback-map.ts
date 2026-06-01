import type { LastPlayedSummary } from '@/engine/state/player-queue-store';
import { sermonDocToCatalogRow } from '@/engine/utils/library-map';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';

export type PlaybackProgressRow = {
    sermonId?: string;
    positionSeconds?: number;
    durationSeconds?: number;
    updatedAt?: string;
    sermon?: unknown;
};

function extractSermonId(row: Record<string, unknown>): string {
    if (typeof row.sermonId === 'string' && row.sermonId) {
        return row.sermonId;
    }
    const sermon = row.sermon;
    if (sermon != null && typeof sermon === 'object') {
        const s = sermon as Record<string, unknown>;
        const id = s._id ?? s.id;
        if (id != null) {
            return String(id);
        }
    }
    return '';
}

export function normalizePlaybackProgressList(data: unknown): PlaybackProgressRow[] {
    const rows = Array.isArray(data) ? data : [];
    const out: PlaybackProgressRow[] = [];
    for (const raw of rows) {
        if (raw == null || typeof raw !== 'object') {
            continue;
        }
        const row = raw as Record<string, unknown>;
        const sermonId = extractSermonId(row);
        if (!sermonId) {
            continue;
        }
        out.push({
            sermonId,
            positionSeconds:
                typeof row.positionSeconds === 'number'
                    ? row.positionSeconds
                    : 0,
            durationSeconds:
                typeof row.durationSeconds === 'number'
                    ? row.durationSeconds
                    : undefined,
            updatedAt:
                typeof row.updatedAt === 'string' ? row.updatedAt : undefined,
            sermon: row.sermon,
        });
    }
    return out;
}

export function playbackRowToLastPlayed(
    row: PlaybackProgressRow,
): LastPlayedSummary | null {
    const sermonId = row.sermonId ?? '';
    if (!sermonId) {
        return null;
    }

    let title = '';
    let artist = '';
    let artworkUrl: string | undefined;
    let streamUrl = '';

    if (row.sermon != null) {
        const catalog = sermonDocToCatalogRow(row.sermon);
        if (catalog) {
            title = catalog.title ?? '';
            artist = catalog.minister ?? '';
            artworkUrl =
                typeof catalog.image === 'string' ? catalog.image : undefined;
            streamUrl = typeof catalog.url === 'string' ? catalog.url : '';
        }
    }

    return {
        sermonId,
        title,
        artist,
        artworkUrl,
        durationSec: row.durationSeconds ?? 0,
        lastPositionSec: row.positionSeconds ?? 0,
        streamUrl,
    };
}

export function playbackRowToSermonItem(row: PlaybackProgressRow) {
    if (row.sermon != null) {
        const catalog = sermonDocToCatalogRow(row.sermon);
        if (catalog?.id) {
            return catalogRowToSermonItem(catalog);
        }
    }
    const lp = playbackRowToLastPlayed(row);
    if (!lp?.streamUrl) {
        return null;
    }
    return {
        id: lp.sermonId,
        title: lp.title,
        minister: lp.artist,
        image: lp.artworkUrl ?? null,
        url: lp.streamUrl,
        duration: lp.durationSec || null,
        sourceType: 'stream' as const,
    };
}

export function pickNewerLastPlayed(
    local: LastPlayedSummary | null | undefined,
    server: LastPlayedSummary | null | undefined,
): LastPlayedSummary | null {
    if (!local?.sermonId && !server?.sermonId) {
        return null;
    }
    if (!local?.sermonId) {
        return server ?? null;
    }
    if (!server?.sermonId) {
        return local;
    }
    if (local.sermonId !== server.sermonId) {
        return local;
    }
    return local.lastPositionSec >= (server.lastPositionSec ?? 0)
        ? local
        : server;
}
