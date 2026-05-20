import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContextType } from '@/context/apps/useContextType';
import { GET_LOGGEDIN_USER } from '@/context/types';
import api from '../../api';
import { queryKeys } from '../../utils/query-keys';
import { mapApiUserToContext } from '../../utils/map-api-user';
import type { UpdateListenerDTO } from '../../dtos/listener.dto';

export function useCurrentUserQuery(enabled = true) {
    const { userContext } = useContextType();

    return useQuery({
        queryKey: queryKeys.users.me(),
        enabled,
        queryFn: async () => {
            const res = await api.user.getCurrentUser();
            if (res.error) {
                throw new Error(res.message || 'Failed to load user');
            }
            const data = res.data as Record<string, unknown>;
            const mapped = mapApiUserToContext(data);
            userContext.setResource(GET_LOGGEDIN_USER, mapped);
            userContext.setUserType(String(data.userType ?? ''));
            return mapped;
        },
    });
}

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();

    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            api.user.updateProfile(payload),
        onSuccess: (res) => {
            if (res.error || !res.data) {
                return;
            }
            const mapped = mapApiUserToContext(
                res.data as Record<string, unknown>,
            );
            userContext.setResource(GET_LOGGEDIN_USER, mapped);
            queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
        },
    });
}

export function useUpdateListenerMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateListenerDTO) =>
            api.listener.updateListener(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.listener.me(),
            });
        },
    });
}

export const useUser = () => {
    const currentUserQuery = useCurrentUserQuery();
    const updateProfile = useUpdateProfileMutation();
    const updateListener = useUpdateListenerMutation();

    return {
        currentUserQuery,
        updateProfile,
        updateListener,
        useCurrentUserQuery,
        useUpdateProfileMutation,
        useUpdateListenerMutation,
    };
};
