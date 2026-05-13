import { useQuery } from '@tanstack/react-query';

type ProfileMeOptions = {
    /** When false, the query does not run. Kept for call-site compatibility. */
    enabled?: boolean;
};

const PROFILE_ME_STUB_KEY = ['profile', 'me', 'stub', 'mobile'] as const;

/**
 * `/profile/me` was removed from the API. This hook stays as a no-op query so
 * callers keep the same shape (`data` stays undefined; `isLoading` is false).
 */
export function useProfileMeQuery(_options?: ProfileMeOptions) {
    return useQuery({
        queryKey: PROFILE_ME_STUB_KEY,
        queryFn: async () => undefined,
        /** No network; keeps hook callable without firing requests. */
        enabled: false,
        staleTime: Infinity,
    });
}
