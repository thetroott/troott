import { useCallback, useMemo, type ReactNode } from 'react';
import { create } from 'zustand';

import type { ISetLoading, IUnsetLoading } from '@/utils/interfaces.util';

type AppUser = Record<string, unknown> | null;

type UserStore = {
    user: AppUser;
    userType: string;
    setUser: (user: Record<string, unknown>) => void;
    setUserType: (userType: string) => void;
};

const useUserStore = create<UserStore>((set) => ({
    user: null,
    userType: '',
    setUser: (user) => set({ user }),
    setUserType: (userType) => set({ userType }),
}));

const noopLoading = async (_data: ISetLoading | IUnsetLoading) => {
    /* Legacy global loading lived in removed `@troott/state`; app routes use local/query loading. */
};

/**
 * In-app replacement for the removed `@troott/state` workspace package (web).
 */
export function TroottStateProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function useContextType() {
    const user = useUserStore((s) => s.user);
    const userType = useUserStore((s) => s.userType);
    const setUser = useUserStore((s) => s.setUser);
    const setUserType = useUserStore((s) => s.setUserType);

    const userContext = useMemo(
        () => ({
            user,
            userType,
            setUser,
            setUserType,
            setLoading: noopLoading as (data: ISetLoading) => Promise<void>,
            unsetLoading: noopLoading as (data: IUnsetLoading) => Promise<void>,
        }),
        [user, userType, setUser, setUserType],
    );

    return { userContext };
}

export function usePlaybackDispatch() {
    return useCallback((_action: unknown) => {}, []);
}

export function useQueueDispatch() {
    return useCallback((_action: unknown) => {}, []);
}
