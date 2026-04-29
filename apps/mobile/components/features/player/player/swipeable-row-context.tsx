import React, { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

export type SwipeableRowContextValue = {
    tx: SharedValue<number>;
    menuOpenSV: SharedValue<boolean>;
    leftWidth: number;
    rightWidth: number;
};

const SwipeableRowContext = createContext<SwipeableRowContextValue | null>(
    null,
);

export function SwipeableRowProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: SwipeableRowContextValue;
}) {
    return (
        <SwipeableRowContext.Provider value={value}>
            {children}
        </SwipeableRowContext.Provider>
    );
}

/**
 * Prefer `children={(row) => ...}` on `SwipeableRow` and pass `row.tx` into `useAnimatedStyle`
 * callers. React context can break Reanimated 4 Worklet closure sharing for `SharedValue` handles.
 */
export function useSwipeableRowContext(): SwipeableRowContextValue {
    const ctx = useContext(SwipeableRowContext);
    if (ctx == null) {
        throw new Error(
            'useSwipeableRowContext must be used within SwipeableRow',
        );
    }
    return ctx;
}
