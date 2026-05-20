import { useQuery } from '@tanstack/react-query';
import api from '@/api/config';
import { accountQueryKeys } from '@/constants/account-query-keys';
import type { IAPIResponse } from '@/api/types';

/**
 * Loads the signed-in account via `api.user.getCurrentAccount`.
 */
export function useCurrentAccountQuery(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: accountQueryKeys.current(),
        queryFn: async () => {
            const res: IAPIResponse = await api.user.getCurrentAccount();
            if (res.error) {
                throw new Error(res.message || 'Could not load account');
            }
            return res.data;
        },
        enabled: options?.enabled ?? true,
    });
}

export default useCurrentAccountQuery;
