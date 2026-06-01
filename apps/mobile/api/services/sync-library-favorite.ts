import api from '../api';

export class LibraryNotFoundError extends Error {
    constructor(message = 'Library not ready') {
        super(message);
        this.name = 'LibraryNotFoundError';
    }
}

export function isLibraryNotFoundMessage(message: string | undefined): boolean {
    return String(message ?? '')
        .toLowerCase()
        .includes('library not found');
}

export function extractSermonIdFromLibraryItem(
    item: Record<string, unknown>,
): string {
    const ref = item.sermon ?? item.itemId ?? item.id;
    if (typeof ref === 'object' && ref !== null) {
        const o = ref as Record<string, unknown>;
        return String(o._id ?? o.id ?? '');
    }
    return String(ref ?? '');
}

export function applyFavoriteToLibraryItems(
    items: unknown[],
    sermonId: string,
    favourite: boolean,
): Record<string, unknown>[] {
    let found = false;
    const next = items.map((row) => {
        const item = row as Record<string, unknown>;
        const id = extractSermonIdFromLibraryItem(item);
        if (id !== sermonId) {
            return item;
        }
        found = true;
        return {
            ...item,
            flags: {
                ...(typeof item.flags === 'object' && item.flags !== null
                    ? (item.flags as Record<string, unknown>)
                    : {}),
                favourite,
            },
        };
    });

    if (!found && favourite) {
        next.push({
            id: sermonId,
            type: 'sermon',
            sermon: sermonId,
            addedFrom: 'manual',
            flags: {
                favourite: true,
                liked: false,
                downloaded: false,
                pinned: false,
            },
        });
    }

    return next;
}

export async function ensureUserLibrary(
    userId: string,
): Promise<Record<string, unknown>> {
    const libRes = await api.library.getLibraryByUser(userId);
    if (!libRes.error && libRes.data) {
        return libRes.data as Record<string, unknown>;
    }

    if (
        !isLibraryNotFoundMessage(libRes.message) &&
        libRes.status !== 404
    ) {
        throw new Error(libRes.message || 'Failed to load library');
    }

    const listenerRes = await api.listener.getCurrentListener();
    if (listenerRes.error || !listenerRes.data) {
        throw new LibraryNotFoundError(
            listenerRes.message || 'Listener profile not found',
        );
    }

    const listener = listenerRes.data as Record<string, unknown>;
    const listenerId = String(listener._id ?? listener.id ?? '');
    if (!listenerId) {
        throw new LibraryNotFoundError('Listener profile not found');
    }

    const createRes = await api.library.createLibrary({ listenerId });
    if (createRes.error) {
        throw new Error(createRes.message || 'Failed to create library');
    }

    const retry = await api.library.getLibraryByUser(userId);
    if (retry.error || !retry.data) {
        throw new Error(retry.message || 'Library not found after create');
    }

    return retry.data as Record<string, unknown>;
}

export async function syncLibraryFavorite(
    userId: string,
    sermonId: string,
    favourite: boolean,
): Promise<void> {
    const library = await ensureUserLibrary(userId);
    const items = Array.isArray(library.items) ? library.items : [];
    const hasItem = items.some(
        (row) =>
            extractSermonIdFromLibraryItem(row as Record<string, unknown>) ===
            sermonId,
    );

    if (!hasItem && !favourite) {
        return;
    }

    const nextItems = applyFavoriteToLibraryItems(items, sermonId, favourite);
    const res = await api.library.updateLibrary(userId, {
        ...library,
        items: nextItems,
    });

    if (res.error) {
        throw new Error(res.message || 'Failed to update library');
    }
}

export function favoriteIdsFromLibrary(
    library: Record<string, unknown> | null | undefined,
): string[] {
    if (!library || !Array.isArray(library.items)) {
        return [];
    }

    const ids: string[] = [];
    for (const row of library.items) {
        const item = row as Record<string, unknown>;
        const flags = item.flags as Record<string, unknown> | undefined;
        if (flags?.favourite !== true) {
            continue;
        }
        const id = extractSermonIdFromLibraryItem(item);
        if (id) {
            ids.push(id);
        }
    }
    return ids;
}
