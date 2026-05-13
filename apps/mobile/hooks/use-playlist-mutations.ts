import { useMutation, useQueryClient } from '@tanstack/react-query';

import axiosService from '@/apis/core/axios';
import { QueryKeys } from '@/utils/enums.util';
import { useContextType } from '@/state/app-state';

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

export type AddSermonToPlaylistVars = {
    playlistId: string;
    sermonId: string;
    /** Must equal the target playlist's `playlistType` on the server. */
    playlistItemType: string;
};

/**
 * PATCH `/playlists/:playlistId/add` — persists a sermon id into a user playlist.
 */
export function useAddSermonToPlaylistMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useMutation({
        mutationFn: async ({
            playlistId,
            sermonId,
            playlistItemType,
        }: AddSermonToPlaylistVars) => {
            const raw = await axiosService.call({
                method: 'PATCH',
                type: 'default',
                path: `/playlists/${encodeURIComponent(playlistId)}/add`,
                isAuth: true,
                payload: {
                    itemId: sermonId,
                    type: playlistItemType,
                },
            });
            return parseApi<unknown>(raw);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QueryKeys.Playlists, userId],
            });
        },
    });
}
