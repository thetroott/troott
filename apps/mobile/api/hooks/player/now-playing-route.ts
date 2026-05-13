import type { NavigationState, PartialState } from '@react-navigation/native';
import { useNavigationContainerRef } from 'expo-router';
import { useLayoutEffect, useState } from 'react';

function getDeepestFocusedRouteName(
    state: NavigationState | undefined,
): string | undefined {
    if (!state?.routes?.length) return undefined;
    const route = state.routes[state.index ?? 0];
    if (route.state) {
        const nested = getDeepestFocusedRouteName(
            route.state as NavigationState,
        );
        return nested ?? route.name;
    }
    return route.name;
}

function isNowPlayingRouteName(name: string | undefined): boolean {
    const n = name?.toLowerCase();
    return n === 'player';
}

function computeIsNowPlayingFocused(
    state: NavigationState | PartialState<NavigationState> | undefined,
): boolean {
    if (!state?.routes?.length) return false;
    const idx = state.index ?? 0;
    const top = state.routes[idx];
    if (isNowPlayingRouteName(top?.name)) return true;
    return isNowPlayingRouteName(
        getDeepestFocusedRouteName(state as NavigationState),
    );
}

/**
 * True when the root stack is showing the now-playing modal (`player`), regardless of tab pathname.
 *
 * Uses the root `NavigationContainer` ref and `state` / `ready` listeners instead of `useRootNavigationState`,
 * which subscribes to the raw root state snapshot and can trigger infinite re-renders when ref identity churns.
 */
export function useIsNowPlayingStackRouteFocused(): boolean {
    const navigationRef = useNavigationContainerRef();
    const [focused, setFocused] = useState(false);

    useLayoutEffect(() => {
        const nav = navigationRef.current;
        if (!nav) return;

        const pushIfChanged = (next: boolean) => {
            setFocused((prev) => (prev === next ? prev : next));
        };

        const syncFromState = (
            root: NavigationState | PartialState<NavigationState> | undefined,
        ) => {
            pushIfChanged(computeIsNowPlayingFocused(root));
        };

        const syncFromRef = () => {
            if (!nav.isReady()) return;
            try {
                syncFromState(nav.getRootState());
            } catch {
                pushIfChanged(false);
            }
        };

        syncFromRef();

        const unsubState = nav.addListener('state', (e) => {
            syncFromState(e.data.state);
        });

        const unsubReady = nav.addListener('ready', () => {
            syncFromRef();
        });

        return () => {
            unsubState();
            unsubReady();
        };
    }, [navigationRef]);

    return focused;
}
