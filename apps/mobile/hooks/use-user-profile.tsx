import { usersService } from '@/api/services';
import { getToken } from '@/api/storage/auth';
import { User } from '@/api/types';
import { queryKeys } from '@/api/utils/query-keys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface UseUserProfileReturn {
    user: User | null;
    streak: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
    const queryClient = useQueryClient();
    const [streak, setStreak] = useState<number>(0);

    // First, try to get user from React Query cache (set on login/register)
    const cachedUser = queryClient.getQueryData<User | null>(
        queryKeys.auth.user(),
    );

    // If we have a cached user with ID, fetch fresh data to ensure it's up to date
    // This ensures we have the latest user data after onboarding/partner linking
    const shouldFetch = !!cachedUser?.id;
    const userId = cachedUser?.id || '';

    const {
        data: fetchedUser,
        isLoading: isFetching,
        error,
        refetch: refetchQuery,
    } = useQuery({
        queryKey: queryKeys.users.detail(userId),
        queryFn: () => usersService.getUserById(userId),
        enabled: shouldFetch && !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes - shorter to ensure fresh data
        retry: false,
    });

    // Use fetched user if available, otherwise use cached user
    const user = (fetchedUser || cachedUser) as User | null;

    // Check if we have a token to determine if we should show loading
    const [hasToken, setHasToken] = useState<boolean | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            const token = await getToken();
            setHasToken(!!token);
        };
        checkToken();
    }, []);

    const refetch = async () => {
        if (cachedUser?.id) {
            await refetchQuery();
        } else {
            // If no cached user, try to get from cache again
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
        }
    };

    // Mock streak for now (can be replaced with actual API call)
    useEffect(() => {
        // TODO: Fetch actual streak from API
        setStreak(12);
    }, []);

    return {
        user: user || null,
        refetch,
        streak,
        isLoading: hasToken === null ? true : shouldFetch ? isFetching : false,
        error: error as Error | null,
    };
};
