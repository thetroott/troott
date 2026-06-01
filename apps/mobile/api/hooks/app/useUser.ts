import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContextType } from '@/context';
import { GET_LISTENER, GET_LOGGEDIN_USER } from '@/context/types';
import type { SessionUser } from '@/context/user/types';
import api from '../../api';
import { queryKeys } from '../../query-keys';
import type { UpdateListenerDTO } from '../../dtos/listener.dto';

export function useCurrentUserQuery(enabled = true) {
    const { userContext } = useContextType();
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.users.me(),
        enabled,
        queryFn: async () => {
            const res = await api.user.getCurrentUser();
            if (res.error) {
                throw new Error(res.message || 'Failed to load user');
            }
            const data = res.data as Record<string, unknown>;
            const mapped: NonNullable<SessionUser> = {
                id: String(data.id ?? ''),
                email: String(data.email ?? ''),
                firstName: String(data.firstName ?? ''),
                lastName: String(data.lastName ?? ''),
                userType: data.userType,
                isActive: data.isActive,
                isAdmin: data.isAdmin,
                isSuper: data.isSuper,
                isLocked: data.isLocked,
                roles: data.roles,
                status: data.status,
                onboard: data.onboard,
                avatar: data.avatar,
                phoneNumber: data.phoneNumber,
            };
            userContext.setResource(GET_LOGGEDIN_USER, mapped);
            userContext.setUserType(String(data.userType ?? ''));
            queryClient.setQueryData(queryKeys.auth.user(), mapped);
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
            const payload = res.data as Record<string, unknown>;
            const mapped: NonNullable<SessionUser> = {
                id: String(payload.id ?? ''),
                email: String(payload.email ?? ''),
                firstName: String(payload.firstName ?? ''),
                lastName: String(payload.lastName ?? ''),
                userType: payload.userType,
                isActive: payload.isActive,
                isAdmin: payload.isAdmin,
                isSuper: payload.isSuper,
                isLocked: payload.isLocked,
                roles: payload.roles,
                status: payload.status,
                onboard: payload.onboard,
                avatar: payload.avatar,
                phoneNumber: payload.phoneNumber,
            };
            userContext.setResource(GET_LOGGEDIN_USER, mapped);
            queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
        },
    });
}

export function useUpdateListenerMutation() {
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
