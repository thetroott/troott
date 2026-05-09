import { useQuery } from '@tanstack/react-query';
import { troottAPIClient } from '../api/_base/config';
import { queryKeys } from './queryKeys';

export function useDiscoveryHome(enabled = true) {
    return useQuery({
        queryKey: queryKeys.discovery.home,
        enabled,
        queryFn: async () => {
            const res = await troottAPIClient().discovery.getHome();
            return res.data;
        },
    });
}
