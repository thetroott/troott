import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContextType } from '@/context';
import { GET_LISTENER } from '@/context/types';
import api from '../../api';
import { queryKeys } from '../../query-keys';
import type { UpdateListenerDTO } from '../../dtos/listener.dto';

export function useListenerProfileQuery(enabled = true) {
    const { userContext } = useContextType();

    return useQuery({
        queryKey: queryKeys.listener.me(),
        queryFn: async () => {
            const res = await api.listener.getCurrentListener();
            if (res.error) {
                throw new Error(res.message || 'Failed to load listener');
            }
            const data = res.data as Record<string, unknown>;
            userContext.setResource(GET_LISTENER, data);
            return data;
        },
        enabled,
    });
}

export function useUpdateListenerProfileMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();

    return useMutation({
        mutationFn: (payload: UpdateListenerDTO) =>
            api.listener.updateListener(payload),
        onSuccess: (res) => {
            if (!res.error && res.data) {
                userContext.setResource(
                    GET_LISTENER,
                    res.data as Record<string, unknown>,
                );
            }
            queryClient.invalidateQueries({
                queryKey: queryKeys.listener.me(),
            });
        },
    });
}

export const useListener = () => ({
    useListenerProfileQuery,
    useUpdateListenerProfileMutation,
});
