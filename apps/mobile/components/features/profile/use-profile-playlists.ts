import { useMemo } from 'react';

import {
    useLibrarySessionEnabled,
    usePlaylistsQuery,
} from '@/api/hooks/app/useLibrary';
import { playlistDocToRow } from '@/engine/utils/library-map';
import { useProfileIdentity } from './use-profile-identity';
import type { ProfilePlaylistItem } from './types';

const FALLBACK_COVER = require('@/assets/images/cover.jpg');

function normalizePlaylistRows(raw: unknown): unknown[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object' && raw !== null && 'items' in raw) {
        const items = (raw as { items: unknown }).items;
        return Array.isArray(items) ? items : [];
    }
    return [];
}

export function useProfilePlaylists() {
    const sessionReady = useLibrarySessionEnabled();
    const { displayName } = useProfileIdentity();
    const { data, isLoading, isError, refetch } = usePlaylistsQuery(sessionReady);

    const items = useMemo((): ProfilePlaylistItem[] => {
        const rows = normalizePlaylistRows(data);
        const mapped: ProfilePlaylistItem[] = [];

        for (const doc of rows) {
            const row = playlistDocToRow(doc);
            if (!row) continue;
            mapped.push({
                id: row.id,
                title: row.title,
                category: 'Playlist',
                author: displayName,
                metric: '',
                image:
                    row.image && row.image.length > 0
                        ? { uri: row.image }
                        : FALLBACK_COVER,
            });
        }

        return mapped;
    }, [data, displayName]);

    return { items, isLoading, isError, refetch };
}
