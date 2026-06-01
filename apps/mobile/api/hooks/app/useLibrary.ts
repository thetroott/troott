import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContextType } from '@/context';
import api from '../../api';
import { libraryKeys, queryKeys } from '../../query-keys';

/** True when session user id exists — gate library/playlist queries (feat-0012). */
export function useLibrarySessionEnabled(): boolean {
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;
    return userId != null && String(userId).length > 0;
}

/** Requires `userContext.user.id` — keep `enabled` false until session is hydrated. */
export function useUserLibraryQuery(enabled = true) {
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;
    const sessionReady = userId != null && String(userId).length > 0;

    return useQuery({
        queryKey: libraryKeys.user(userId ?? ''),
        queryFn: async () => {
            if (!userId) {
                throw new Error('Not signed in');
            }
            const res = await api.library.getLibraryByUser(userId);
            if (res.error) {
                const msg = String(res.message ?? '').toLowerCase();
                if (msg.includes('library not found') || res.status === 404) {
                    return null;
                }
                throw new Error(res.message || 'Request failed');
            }
            return (res.data as Record<string, unknown>) ?? null;
        },
        enabled: enabled && sessionReady,
        retry: 1,
    });
}

export function useUpdateLibraryMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => {
            if (!userId) {
                throw new Error('Not signed in');
            }
            return api.library.updateLibrary(userId, payload);
        },
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({
                    queryKey: libraryKeys.user(userId),
                });
            }
        },
    });
}

export function usePlaylistsQuery(enabled = true) {
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;
    const sessionReady = userId != null && String(userId).length > 0;

    return useQuery({
        queryKey: queryKeys.playlist.user(userId ?? ''),
        queryFn: async () => {
            if (!userId) {
                throw new Error('Not signed in');
            }
            const res = await api.playlist.getPlaylistsByUser(userId);
            if (res.error) {
                throw new Error(res.message || 'Request failed');
            }
            const data = res.data;
            if (data == null) {
                return [];
            }
            if (Array.isArray(data)) {
                return data;
            }
            if (
                typeof data === 'object' &&
                data !== null &&
                'items' in data &&
                Array.isArray((data as { items: unknown }).items)
            ) {
                return (data as { items: unknown[] }).items;
            }
            return [];
        },
        enabled: enabled && sessionReady,
        retry: 1,
    });
}

export const useLibrary = () => ({
    useUserLibraryQuery,
    useUpdateLibraryMutation,
    usePlaylistsQuery,
});
