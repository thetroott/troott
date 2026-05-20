import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContextType } from '@/context/apps/useContextType';
import {
    GET_LISTENER,
    GET_LOGGEDIN_USER,
    SET_LISTENER_ONBOARDING,
} from '@/context/types';
import api from '../../api';
import { queryKeys } from '../../utils/query-keys';
import type {
    OnboardMinistersDTO,
    OnboardTopicsDTO,
} from '../../dtos/listener.dto';
import { mapApiUserToContext } from '../../utils/map-api-user';

export function useOnboardingTopicsQuery(enabled = true) {
    return useQuery({
        queryKey: queryKeys.onboarding.topics,
        queryFn: async () => {
            const res = await api.search.searchTopics({ limit: 50 });
            if (res.error) {
                throw new Error(res.message || 'Failed to load topics');
            }
            return res.data;
        },
        enabled,
    });
}

export function useOnboardingMinistersQuery(enabled = true) {
    return useQuery({
        queryKey: queryKeys.onboarding.ministers,
        queryFn: async () => {
            const res = await api.search.searchMinisters({ limit: 30 });
            if (res.error) {
                throw new Error(res.message || 'Failed to load ministers');
            }
            return res.data;
        },
        enabled,
    });
}

async function refreshSession(
    userContext: ReturnType<typeof useContextType>['userContext'],
    queryClient: ReturnType<typeof useQueryClient>,
) {
    const [userRes, listenerRes] = await Promise.all([
        api.user.getCurrentUser(),
        api.listener.getCurrentListener(),
    ]);
    if (!userRes.error && userRes.data) {
        const mapped = mapApiUserToContext(
            userRes.data as Record<string, unknown>,
        );
        userContext.setResource(GET_LOGGEDIN_USER, mapped);
        queryClient.setQueryData(queryKeys.auth.user(), mapped);
    }
    if (!listenerRes.error && listenerRes.data) {
        userContext.setResource(
            GET_LISTENER,
            listenerRes.data as Record<string, unknown>,
        );
    }
}

export function useOnboardTopicsMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();

    return useMutation({
        mutationFn: (payload: OnboardTopicsDTO) =>
            api.listener.onboardTopics(payload),
        onSuccess: async (res) => {
            if (res.error) {
                return;
            }
            userContext.setResource(SET_LISTENER_ONBOARDING, {
                step: 2,
                status: 'in-progress',
            });
            await refreshSession(userContext, queryClient);
        },
    });
}

export function useOnboardMinistersMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();

    return useMutation({
        mutationFn: (payload: OnboardMinistersDTO) =>
            api.listener.onboardMinisters(payload),
        onSuccess: async (res) => {
            if (res.error) {
                return;
            }
            userContext.setResource(SET_LISTENER_ONBOARDING, {
                step: 3,
                status: 'completed',
            });
            await refreshSession(userContext, queryClient);
        },
    });
}

export function useSkipOnboardingMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();

    return useMutation({
        mutationFn: () => api.listener.skipOnboarding(),
        onSuccess: async () => {
            await refreshSession(userContext, queryClient);
        },
    });
}

export const useListenerOnboarding = () => ({
    useOnboardingTopicsQuery,
    useOnboardingMinistersQuery,
    useOnboardTopicsMutation,
    useOnboardMinistersMutation,
    useSkipOnboardingMutation,
});
