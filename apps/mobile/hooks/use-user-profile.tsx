import { useContextType } from '@/state/app-state';
import { useProfileMeQuery } from '@/hooks/profile/use-profile-me';
import { useEffect, useMemo, useState } from 'react';
import storage from '@/services/storage-service';

type UserSnapshot = { id?: string; [key: string]: unknown } | null;

interface UseUserProfileReturn {
    user: UserSnapshot;
    streak: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Session user from the persisted store plus `/profile/me` when logged in.
 */
export const useUserProfile = (): UseUserProfileReturn => {
    const { userContext } = useContextType();
    const user = userContext.user as UserSnapshot;
    const [streak, setStreak] = useState<number>(0);
    const [hasToken, setHasToken] = useState<boolean | null>(null);

    const profileQuery = useProfileMeQuery({
        enabled: Boolean(user?.id),
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
};
