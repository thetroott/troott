/**
 * User and profile data: current user (`GET /user`), optional staff list, listener profile update,
 * disabled stub query for legacy `/profile/me` call sites, and session-backed profile UI state.
 */
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IAPIResponse } from '@/utils/interface.utl';

import { storage } from '../../services/mmkv-storage';
import { useContextType } from '@/state/app-state';

import { listenerService } from '../../clients/listener';
import { usersService } from '../../clients/user';
import { queryKeys } from '../../utils/query-keys';

const PROFILE_ME_STUB_KEY = ['profile', 'me', 'stub', 'mobile'] as const;

export type UseUserOptions = {
    /** `GET /user` — signed-in user profile. */
    me?: { enabled?: boolean };
    /** `GET /user/list` — optional listing (off unless `enabled: true`). */
    users?: {
        enabled?: boolean;
        params?: { limit?: number; offset?: number };
    };
    /**
     * Legacy `/profile/me` hook shape; query is disabled and never hits the network.
     * `enabled` is accepted for call-site compatibility only.
     */
    profileMe?: { enabled?: boolean };
};

/**
 * @example
 * const { meQuery, updateProfileMutation } = useUser();
 * @example
 * const { usersQuery } = useUser({ users: { enabled: true, params: { limit: 20 } } });
 */
export function useUser(options?: UseUserOptions) {
    const queryClient = useQueryClient();

    const meEnabled = options?.me?.enabled ?? true;
    const usersEnabled = options?.users?.enabled ?? false;
    const usersParams = options?.users?.params;

    const meQuery = useQuery({
        queryKey: queryKeys.users.me(),
        queryFn: async () => {
            const res = await usersService.getCurrentUser();
            if (res.error) {
                throw new Error(res.message);
            }
            return res.data;
        },
        enabled: meEnabled,
        staleTime: 5 * 60 * 1000,
    });

    const usersQuery = useQuery({
        queryKey: queryKeys.users.list(usersParams),
        queryFn: async () => {
            const res = await usersService.getUsers(usersParams);
            if (res.error) {
                throw new Error(res.message);
            }
            const data = res.data;
            if (Array.isArray(data)) {
                return data;
            }
            return [];
        },
        enabled: usersEnabled,
        staleTime: 2 * 60 * 1000,
    });

    const profileMeQuery = useQuery({
        queryKey: PROFILE_ME_STUB_KEY,
        queryFn: async () => undefined,
        enabled: false,
        staleTime: Infinity,
    });

    const updateProfileMutation = useMutation({
        mutationFn: (payload: unknown): Promise<IAPIResponse> =>
            listenerService.updateProfile(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        },
    });

    return {
        meQuery,
        usersQuery,
        profileMeQuery,
        updateProfileMutation,
    };
}

type UserSnapshot = { id?: string; [key: string]: unknown } | null;

export interface UseUserProfileReturn {
    user: UserSnapshot;
    streak: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Session user from the persisted store plus `/profile/me` stub query when logged in.
 */
export function useUserProfile(): UseUserProfileReturn {
    const { userContext } = useContextType();
    const user = userContext.user as UserSnapshot;
    const [streak, setStreak] = useState<number>(0);
    const [hasToken, setHasToken] = useState<boolean | null>(null);

    const { profileMeQuery: profileQuery } = useUser({
        me: { enabled: false },
        users: { enabled: false },
    });

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            const t = await storage.getToken();
            if (!cancelled) setHasToken(!!t);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setStreak(12);
    }, []);

    const refetch = async () => {
        await profileQuery.refetch();
    };

    const isLoading = useMemo(() => {
        if (hasToken === null) return true;
        if (!user?.id) return false;
        return profileQuery.isLoading;
    }, [hasToken, profileQuery.isLoading, user?.id]);

    return {
        user: user ?? null,
        refetch,
        streak,
        isLoading,
        error: profileQuery.error as Error | null,
    };
}
