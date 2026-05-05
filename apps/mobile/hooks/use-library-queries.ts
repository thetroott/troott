import { useQuery } from '@tanstack/react-query';

import axiosService from '@/api/core/axios';
import { QueryKeys } from '@/utils/enums.util';
import { useUserStore } from '@/stores/user-store';

function parseApi<T>(raw: unknown): T {
    const r = raw as { error?: boolean; message?: string; data?: unknown };
    if (r && typeof r === 'object' && r.error) {
        throw new Error(r.message || 'Request failed');
    }
    if (r && typeof r === 'object' && 'data' in r && r.data !== undefined) {
        return r.data as T;
    }
    return raw as T;
}

/** Staff-only listing — kept for tooling; app uses {@link useUserLibraryQuery}. */
function parseApiMaybeEmpty(raw: unknown): unknown | null {
    const r = raw as { error?: boolean; message?: string; data?: unknown };
    if (r && typeof r === 'object' && r.error) {
        const msg = String(r.message ?? '').toLowerCase();
        if (msg.includes('library not found')) {
            return null;
        }
        throw new Error(r.message || 'Request failed');
    }
    if (r && typeof r === 'object' && 'data' in r && r.data !== undefined) {
        return r.data;
    }
    return raw;
}

/**
 * Current user's library (`GET /library/user/:userId`).
 * Returns `null` when no library document exists yet (404).
 */
export function useUserLibraryQuery(enabled = true) {
    const userId = useUserStore((s) => s.user?.id);

    return useQuery({
        queryKey: [QueryKeys.Libraries, userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('Not signed in');
            }
            const raw = await axiosService.call({
                method: 'GET',
                type: 'default',
                path: `/library/user/${encodeURIComponent(userId)}`,
                isAuth: true,
            });
            const parsed = parseApiMaybeEmpty(raw);
            return parsed as Record<string, unknown> | null;
        },
        enabled: enabled && !!userId,
        retry: 1,
    });
}

export function usePlaylistsQuery(enabled = true) {
    const userId = useUserStore((s) => s.user?.id);

    return useQuery({
        queryKey: [QueryKeys.Playlists, userId],
        queryFn: async () => {
            const raw = await axiosService.call({
                method: 'GET',
                type: 'default',
                path: '/playlists',
                isAuth: true,
            });
            return parseApi<unknown>(raw);
        },
        enabled: enabled && !!userId,
        retry: 1,
    });
}
