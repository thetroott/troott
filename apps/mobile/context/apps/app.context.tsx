import { useCallback } from 'react';

import { useAppContext } from '../app/appState';
import { useAuthContext } from '../auth/authState';
import { useUserContext } from '../user/userState';
import type { IAppContextValue } from '../app/types';
import type { IAuthContextValue } from '../auth/types';
import type { IUserContextValue } from '../user/types';

export function useContextType(): {
    userContext: IUserContextValue;
    appContext: IAppContextValue;
    authContext: IAuthContextValue;
} {
    return {
        userContext: useUserContext(),
        authContext: useAuthContext(),
        appContext: useAppContext(),
    };
}

/** RNTP bridge: playback dispatch noop on mobile (engine owns queue). */
export function usePlaybackDispatch() {
    return useCallback((_action: unknown) => {
        /* engine + player-ui-store remain source of truth */
    }, []);
}

/** RNTP bridge: queue dispatch noop on mobile. */
export function useQueueDispatch() {
    return useCallback((_action: unknown) => {
        /* engine + player-ui-store remain source of truth */
    }, []);
}
