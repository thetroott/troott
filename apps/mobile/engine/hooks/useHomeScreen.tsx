import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDiscoveryHomeQuery } from '@/api/hooks/app/useDiscovery';
import { queryKeys } from '@/api/query-keys';

/**
 * Batches home feed refresh for pull-to-refresh and manual retry.
 */
export function useHomeScreen() {
    const queryClient = useQueryClient();
    const discovery = useDiscoveryHomeQuery();

    const refresh = useMutation({
        mutationFn: async () => {
            await Promise.all([
                discovery.refetch(),
                queryClient.invalidateQueries({
                    queryKey: queryKeys.discovery.all,
                }),
            ]);
            return true;
        },
    });

    return {
        isRefreshing: refresh.isPending || discovery.isFetching,
        refresh: () => refresh.mutate(),
        discoveryError: discovery.error,
        retryDiscovery: () => discovery.refetch(),
        isDiscoveryLoading: discovery.isLoading,
    };
}
