import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../api';
import { queryKeys } from '../../utils/query-keys';

export function useResolveShareLinkQuery(
    token: string,
    resourceId?: string,
    enabled = true,
) {
    return useQuery({
        queryKey: queryKeys.share.resolve(token, resourceId),
        queryFn: async () => {
            const res = await api.share.resolveShareLink({
                token,
                resourceId,
            });
            if (res.error) {
                throw new Error(res.message || 'Invalid share link');
            }
            return res.data as Record<string, unknown>;
        },
        enabled: enabled && !!token,
    });
}

export function useShareSermon() {
    return useMutation({
        mutationFn: async (input: {
            sermonId: string;
            title: string;
            shareableUrl?: string;
        }) => {
            const url =
                input.shareableUrl ??
                `troott://sermon/${encodeURIComponent(input.sermonId)}`;
            return {
                message: `${input.title}\n${url}`,
                url,
            };
        },
    });
}

export const useShare = () => ({
    useResolveShareLinkQuery,
    useShareSermon,
});
