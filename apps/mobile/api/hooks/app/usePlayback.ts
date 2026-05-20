import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../api';
import { queryKeys } from '../../utils/query-keys';

/** REST playback progress — separate from `api/hooks/player/*` (RNTP). */
export function usePlaybackForSermonQuery(sermonId: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.playback.sermon(sermonId),
        queryFn: async () => {
            const res = await api.playback.getPlaybackForSermon(sermonId);
            if (res.error) {
                throw new Error(res.message || 'Playback not found');
            }
            return res.data;
        },
        enabled: enabled && !!sermonId,
    });
}

export function useSavePlaybackProgressMutation() {
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            api.playback.savePlaybackProgress(payload),
    });
}

export const usePlayback = () => ({
    usePlaybackForSermonQuery,
    useSavePlaybackProgressMutation,
});
