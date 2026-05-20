import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, ApiErrorType } from '@/api/errors';
import { useContextType } from '@/context/apps/useContextType';
import api from '../../api';
import { libraryKeys, queryKeys } from '../../utils/query-keys';
import type { IAPIResponse } from '@/utils/interface.utl';

function parseLibraryResponse(res: IAPIResponse): Record<string, unknown> | null {
    if (res.error) {
        const msg = String(res.message ?? '').toLowerCase();
        if (msg.includes('library not found')) {
            return null;
        }
        throw new Error(res.message || 'Request failed');
    }
    return (res.data as Record<string, unknown>) ?? null;
}

export function useUserLibraryQuery(enabled = true) {
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useQuery({
        queryKey: libraryKeys.user(userId ?? ''),
        queryFn: async () => {
            if (!userId) {
                throw new Error('Not signed in');
            }
            try {
                const res = await api.library.getLibraryByUser(userId);
                return parseLibraryResponse(res);
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

    return useQuery({
        queryKey: queryKeys.playlist.user(userId ?? ''),
        queryFn: async () => {
            const res = await api.playlist.getAllPlaylists();
            if (res.error) {
                throw new Error(res.message || 'Request failed');
            }
            return res.data;
        },
        enabled: enabled && !!userId,
        retry: 1,
    });
}

export const useLibrary = () => ({
    useUserLibraryQuery,
    useUpdateLibraryMutation,
    usePlaylistsQuery,
});
