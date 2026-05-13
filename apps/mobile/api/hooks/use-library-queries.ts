import { useQuery } from '@tanstack/react-query';

import { get } from '@/api/client';
import { ApiError, ApiErrorType } from '@/api/errors';
import { API_BASE_PATH } from '@/api/config';
import { QueryKeys } from '@/utils/enums.util';
import { useContextType } from '@/state/app-state';
import type { IAPIResponse } from '@/utils/interface.utl';

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

/** Internal tooling listing — app uses {@link useUserLibraryQuery}. */
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
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useQuery({
        queryKey: [QueryKeys.Libraries, userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('Not signed in');
            }
            try {
                const raw = await get<IAPIResponse>(
                    `${API_BASE_PATH}/library/user/${encodeURIComponent(userId)}`,
                );
                const parsed = parseApiMaybeEmpty(raw);
                return parsed as Record<string, unknown> | null;
            } catch (e) {
                if (
                    e instanceof ApiError &&
                    (e.statusCode === 404 ||
                        e.type === ApiErrorType.NOT_FOUND)
                ) {
                    return null;
                }
                throw e;
            }
        },
        enabled: enabled && !!userId,
        retry: 1,
    });
}

export function usePlaylistsQuery(enabled = true) {
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useQuery({
        queryKey: [QueryKeys.Playlists, userId],
        queryFn: async () => {
            const raw = await get<IAPIResponse>(`${API_BASE_PATH}/playlist`);
            return parseApi<unknown>(raw);
        },
        enabled: enabled && !!userId,
        retry: 1,
    });
}
