import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../api';
import { queryKeys } from '../../query-keys';
import { useLibrarySessionEnabled } from './useLibrary';
import { normalizePlaybackProgressList } from '@/engine/utils/playback-map';

/** REST playback progress — separate from `api/hooks/player/*` (RNTP). */
export function usePlaybackForSermonQuery(sermonId: string, enabled = true) {
    const sessionEnabled = useLibrarySessionEnabled();

    return useQuery({
        queryKey: queryKeys.playback.sermon(sermonId),
        queryFn: async () => {
            const res = await api.playback.getPlaybackForSermon(sermonId);
            if (res.error) {
                throw new Error(res.message || 'Playback not found');
            }
            return res.data as Record<string, unknown>;
        },
        enabled: enabled && sessionEnabled && !!sermonId,
    });
}

export function useRecentPlaybackQuery(enabled = true) {
    const sessionEnabled = useLibrarySessionEnabled();

    return useQuery({
        queryKey: queryKeys.playback.recent(),
        queryFn: async () => {
            const res = await api.playback.listPlaybackProgress({ limit: 10 });
            if (res.error) {
                throw new Error(res.message || 'Failed to load playback');
            }
            return normalizePlaybackProgressList(res.data);
        },
        enabled: enabled && sessionEnabled,
        staleTime: 60_000,
    });
}

export function useSavePlaybackProgressMutation() {
    return useMutation({
        mutationFn: (payload: {
            sermonId: string;
            positionSeconds: number;
            durationSeconds?: number;
        }) => api.playback.savePlaybackProgress(payload),
    });
}

export const usePlayback = () => ({
    usePlaybackForSermonQuery,
    useRecentPlaybackQuery,
    useSavePlaybackProgressMutation,
});
