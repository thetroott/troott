import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContextType } from '@/context';
import api from '../../api';
import { playlistKeys } from '../../query-keys';
import type {
    AddPlaylistItemDTO,
    CreatePlaylistDTO,
    PlaylistResponseDTO,
    RemovePlaylistItemDTO,
    UpdatePlaylistDTO,
} from '../../dtos/playlist.dto';

export function usePlaylistByIdQuery(id: string, enabled = true) {
    return useQuery({
        queryKey: playlistKeys.detail(id),
        queryFn: async () => {
            const res = await api.playlist.getPlaylistById(id);
            if (res.error) {
                throw new Error(res.message || 'Request failed');
            }
            return res.data as PlaylistResponseDTO;
        },
        enabled: enabled && !!id,
    });
}

export function useCreatePlaylistMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useMutation({
        mutationFn: (payload: CreatePlaylistDTO) =>
            api.playlist.createPlaylist(payload),
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({
                    queryKey: playlistKeys.user(userId),
                });
            }
            queryClient.invalidateQueries({ queryKey: playlistKeys.all });
        },
    });
}

export function useUpdatePlaylistMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdatePlaylistDTO;
        }) => api.playlist.updatePlaylist(id, payload),
        onSuccess: (_res, vars) => {
            queryClient.invalidateQueries({
                queryKey: playlistKeys.detail(vars.id),
            });
        },
    });
}

export function useDeletePlaylistMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useMutation({
        mutationFn: (id: string) => api.playlist.deletePlaylist(id),
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({
                    queryKey: playlistKeys.user(userId),
                });
            }
        },
    });
}

export type AddSermonToPlaylistVars = {
    playlistId: string;
    sermonId: string;
};

export function useAddSermonToPlaylistMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    return useMutation({
        mutationFn: ({ playlistId, sermonId }: AddSermonToPlaylistVars) => {
            const payload: AddPlaylistItemDTO = {
                itemId: sermonId,
                itemType: 'sermon',
            };
            return api.playlist.addItem(playlistId, payload);
        },
        onSuccess: async (_res, vars) => {
            await queryClient.invalidateQueries({
                queryKey: playlistKeys.detail(vars.playlistId),
            });
            if (userId) {
                await queryClient.invalidateQueries({
                    queryKey: playlistKeys.user(userId),
                });
            }
        },
    });
}

export function useRemovePlaylistItemMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            playlistId,
            payload,
        }: {
            playlistId: string;
            payload: RemovePlaylistItemDTO;
        }) => api.playlist.removeItem(playlistId, payload),
        onSuccess: (_res, vars) => {
            queryClient.invalidateQueries({
                queryKey: playlistKeys.detail(vars.playlistId),
            });
        },
    });
}

export const usePlaylist = () => ({
    usePlaylistByIdQuery,
    useCreatePlaylistMutation,
    useAddSermonToPlaylistMutation,
    useRemovePlaylistItemMutation,
});
