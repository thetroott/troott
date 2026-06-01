import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { queryKeys } from '../../query-keys';

export function useDiscoveryHomeQuery(
    params?: Record<string, unknown>,
    enabled = true,
) {
    return useQuery({
        queryKey: queryKeys.discovery.home(params),
        queryFn: async () => {
            const res = await api.discovery.getHome(params);
            if (res.error) {
                throw new Error(res.message || 'Failed to load discovery home');
            }
            return res.data;
        },
        enabled,
        staleTime: 60_000,
    });
}

export const useDiscovery = () => ({
    useDiscoveryHomeQuery,
});
