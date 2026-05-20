import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { queryKeys } from '../../utils/query-keys';

export function useSermonByIdQuery(id: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.sermon.detail(id),
        queryFn: async () => {
            const res = await api.sermon.getSermonById(id);
            if (res.error) {
                throw new Error(res.message || 'Sermon not found');
            }
            return res.data as Record<string, unknown>;
        },
        enabled: enabled && !!id,
    });
}

export function useSermonsByMinisterQuery(
    ministerId: string,
    params?: Record<string, unknown>,
    enabled = true,
) {
    return useQuery({
        queryKey: queryKeys.sermon.minister(ministerId, params),
        queryFn: async () => {
            const res = await api.sermon.getSermonsByMinister(
                ministerId,
                params,
            );
            if (res.error) {
                throw new Error(res.message || 'Failed to load sermons');
            }
            return res.data;
        },
        enabled: enabled && !!ministerId,
    });
}

export const useSermon = () => ({
    useSermonByIdQuery,
    useSermonsByMinisterQuery,
});
