import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { queryKeys } from '../../query-keys';
import { mapSermonDocsToItems } from '@/engine/utils/library-map';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

async function fetchMinisterSermonRail(
    ministerId: string,
    kind: 'most-played' | 'most-liked' | 'recently-published',
): Promise<SermonItemDTO[]> {
    let res;
    switch (kind) {
        case 'most-played':
            res = await api.sermon.getMinisterMostPlayed(ministerId);
            break;
        case 'most-liked':
            res = await api.sermon.getMinisterMostLiked(ministerId);
            break;
        case 'recently-published':
            res = await api.sermon.getMinisterRecentlyPublished(ministerId);
            break;
    }
    if (res.error) {
        throw new Error(res.message || 'Failed to load sermons');
    }
    return mapSermonDocsToItems(res.data);
}

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
        staleTime: 5 * 60_000,
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
            return mapSermonDocsToItems(res.data);
        },
        enabled: enabled && !!ministerId,
    });
}

export function useMinisterMostPlayedQuery(ministerId: string, enabled = true) {
    return useQuery({
        queryKey: [...queryKeys.sermon.minister(ministerId), 'most-played'],
        queryFn: () => fetchMinisterSermonRail(ministerId, 'most-played'),
        enabled: enabled && !!ministerId,
    });
}

export function useMinisterMostLikedQuery(ministerId: string, enabled = true) {
    return useQuery({
        queryKey: [...queryKeys.sermon.minister(ministerId), 'most-liked'],
        queryFn: () => fetchMinisterSermonRail(ministerId, 'most-liked'),
        enabled: enabled && !!ministerId,
    });
}

export function useMinisterRecentlyPublishedQuery(
    ministerId: string,
    enabled = true,
) {
    return useQuery({
        queryKey: [
            ...queryKeys.sermon.minister(ministerId),
            'recently-published',
        ],
        queryFn: () => fetchMinisterSermonRail(ministerId, 'recently-published'),
        enabled: enabled && !!ministerId,
    });
}

export function useSermonsByTopicQuery(
    topic: string,
    enabled = true,
) {
    return useQuery({
        queryKey: queryKeys.sermon.topic(topic),
        queryFn: async () => {
            const res = await api.sermon.getSermonsByTopic(topic);
            if (res.error) {
                throw new Error(res.message || 'Failed to load topic sermons');
            }
            return mapSermonDocsToItems(res.data);
        },
        enabled: enabled && topic.length > 0,
        staleTime: 5 * 60_000,
    });
}

export const useSermon = () => ({
    useSermonByIdQuery,
    useSermonsByMinisterQuery,
    useMinisterMostPlayedQuery,
    useMinisterMostLikedQuery,
    useMinisterRecentlyPublishedQuery,
    useSermonsByTopicQuery,
});
