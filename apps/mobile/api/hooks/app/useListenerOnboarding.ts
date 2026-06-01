import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { useContextType } from '@/context';
import { SET_LISTENER_ONBOARDING } from '@/context/types';
import api from '../../api';
import { queryKeys } from '../../query-keys';
import type {
    OnboardMinistersDTO,
    OnboardTopicsDTO,
} from '../../dtos/listener.dto';
import {
    apiErrorMessage,
    replaceWithPendingTargetOrHome,
} from '@/api/hooks/app/useAuth';

export function useOnboardingTopicsQuery(enabled = true) {
    return useQuery({
        queryKey: queryKeys.onboarding.topics,
        queryFn: async () => {
            const res = await api.search.searchTopics({ limit: 50 });
            if (res.error) {
                throw new Error(res.message || 'Failed to load topics');
            }
            const data = res.data;
            if (Array.isArray(data)) {
                return data;
            }
            if (
                data &&
                typeof data === 'object' &&
                Array.isArray((data as { topics?: unknown }).topics)
            ) {
                return (data as { topics: unknown[] }).topics;
            }
            return [];
        },
        enabled,
        retry: 1,
        staleTime: 60_000,
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
        retry: 1,
        staleTime: 60_000,
    });
}

export function useOnboardTopicsMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();

    return useMutation({
        mutationFn: (payload: OnboardTopicsDTO) =>
            api.listener.onboardTopics(payload),
        onSuccess: async (res) => {
            if (res.error) {
                toast.error(apiErrorMessage(res));
                return;
            }
            userContext.setResource(SET_LISTENER_ONBOARDING, {
                step: 2,
                status: 'completed',
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.me(),
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.listener.me(),
            });
            await replaceWithPendingTargetOrHome(null);
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
                toast.error(apiErrorMessage(res));
                return;
            }
            userContext.setResource(SET_LISTENER_ONBOARDING, {
                step: 1,
                status: 'in-progress',
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.me(),
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.listener.me(),
            });
        },
    });
}

export function useSkipOnboardingMutation() {
    const queryClient = useQueryClient();
    const { userContext } = useContextType();

    return useMutation({
        mutationFn: () => api.listener.skipOnboarding(),
        onSuccess: async (res) => {
            if (res.error) {
                toast.error(apiErrorMessage(res));
                return;
            }
            userContext.setResource(SET_LISTENER_ONBOARDING, {
                step: 2,
                status: 'completed',
                stage: 'skipped',
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.me(),
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.listener.me(),
            });
            await replaceWithPendingTargetOrHome(null);
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : 'Could not skip onboarding',
            );
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
