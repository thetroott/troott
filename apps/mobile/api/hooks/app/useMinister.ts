import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { queryKeys } from '../../query-keys';

export function useMinisterByIdQuery(id: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.minister.detail(id),
        queryFn: async () => {
            const res = await api.minister.getMinisterById(id);
            if (res.error) {
                throw new Error(res.message || 'Minister not found');
            }
            return res.data;
        },
        enabled: enabled && !!id,
    });
}

export const useMinister = () => ({
    useMinisterByIdQuery,
});
