import { networkStatusTypes } from '@/types/network-status';
import { create, devtools } from '@/lib/zstore';
import {
    getConnectivityStatus,
    getNetworkState,
    subscribeToNetworkState,
} from '@/utils/network';

type NetworkStore = {
    networkStatus: networkStatusTypes | null;
    setNetworkStatus: (status: networkStatusTypes | null) => void;
};

export const useNetworkStore = create<NetworkStore>()(
    devtools(
        (set) => ({
            networkStatus: null,
            setNetworkStatus: (networkStatus) => set({ networkStatus }),
        }),
        {
            name: 'network-store',
        },
    ),
);

export const useNetworkStatus = (): [
    networkStatusTypes | null,
    (status: networkStatusTypes | null) => void,
] => {
    const networkStatus = useNetworkStore((state) => state.networkStatus);
    const setNetworkStatus = useNetworkStore((state) => state.setNetworkStatus);

    return [networkStatus, setNetworkStatus];
};

let subscriptionCleanup: (() => void) | null = null;

/**
 * Subscribes to NetInfo via {@link subscribeToNetworkState} and keeps
 * {@link useNetworkStore} `networkStatus` aligned with {@link getConnectivityStatus}.
 * Call once from the root layout; tear down on unmount (e.g. Fast Refresh).
 *
 * @returns Unsubscribe function.
 */
export function initNetworkStoreSync(): () => void {
    subscriptionCleanup?.();
    subscriptionCleanup = null;

    void getNetworkState().then((state) => {
        useNetworkStore.getState().setNetworkStatus(getConnectivityStatus(state));
    });

    subscriptionCleanup = subscribeToNetworkState((state) => {
        useNetworkStore
            .getState()
            .setNetworkStatus(getConnectivityStatus(state));
    });

    return () => {
        subscriptionCleanup?.();
        subscriptionCleanup = null;
    };
}
