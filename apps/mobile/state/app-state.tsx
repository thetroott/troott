import React, { useCallback, useMemo, type ReactNode } from 'react';

import { useAuthStore } from '@/stores/auth.store';

export type TroottUserContextValue = {
    user: object;
    userType: string;
    setUser: (user: object) => void;
    setUserType: (userType: string) => void;
};

/**
 * Replaces the removed `@troott/state` workspace package for mobile: user slice
 * is backed by `useAuthStore`; playback/queue dispatches are no-ops until a
 * shared consumer exists in-app.
 */
export function TroottStateProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function useContextType(): { userContext: TroottUserContextValue } {
    const user = useAuthStore((s) => s.user);
    const userType = useAuthStore((s) => s.userType);
    const setUser = useAuthStore((s) => s.setUser);
    const setUserType = useAuthStore((s) => s.setUserType);

    const userContext = useMemo(
        () => ({
            user,
            userType,
            setUser,
            setUserType,
        }),
        [user, userType, setUser, setUserType],
    );

    return { userContext };
}

export function usePlaybackDispatch() {
    return useCallback((_action: unknown) => {
        /* bridge target removed with @troott/state; RNTP + player-queue remain source of truth */
    }, []);
}

export function useQueueDispatch() {
    return useCallback((_action: unknown) => {
        /* bridge target removed with @troott/state */
    }, []);
}
