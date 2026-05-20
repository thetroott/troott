import { useCallback, useContext, useMemo } from 'react';

import AppContext from '../app/appContext';
import UserContext from '../user/userContext';
import type { IAppContextValue } from '../app/types';
import type { IUserContextValue } from '../user/types';

export function useContextType(): {
    userContext: IUserContextValue;
    appContext: IAppContextValue;
} {
    const userContext = useContext(UserContext);
    const appContext = useContext(AppContext);

    if (!userContext || !appContext) {
        throw new Error(
            'useContextType must be used within TroottProviders (UserState + AppState)',
        );
    }

    return { userContext, appContext };
}

/** RNTP bridge: playback dispatch noop on mobile (engine owns queue). */
export function usePlaybackDispatch() {
    return useCallback((_action: unknown) => {
        /* engine + player-store remain source of truth */
    }, []);
}

/** RNTP bridge: queue dispatch noop on mobile. */
export function useQueueDispatch() {
    return useCallback((_action: unknown) => {
        /* engine + player-store remain source of truth */
    }, []);
}

/** @deprecated Use useContextType().userContext */
export function useUserContext(): IUserContextValue {
    return useContextType().userContext;
}
