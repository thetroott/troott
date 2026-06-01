import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

import { networkStatusTypes } from '@/api/dtos/network.dto';
import { create, devtools } from '@/lib/zstore';

export type ConnectionType =
    | 'wifi'
    | 'cellular'
    | 'ethernet'
    | 'none'
    | 'unknown';

export enum NetworkQuality {
    EXCELLENT = 'excellent',
    GOOD = 'good',
    POOR = 'poor',
    OFFLINE = 'offline',
}

export interface NetworkState {
    isConnected: boolean;
    type: ConnectionType;
    quality: NetworkQuality;
    isInternetReachable: boolean | null;
}

function mapNetInfoState(state: Awaited<ReturnType<typeof NetInfo.fetch>>): NetworkState {
    const connectionType: ConnectionType =
        state.type === NetInfoStateType.wifi
            ? 'wifi'
            : state.type === NetInfoStateType.cellular
              ? 'cellular'
              : state.type === NetInfoStateType.ethernet
                ? 'ethernet'
                : state.type === NetInfoStateType.none
                  ? 'none'
                  : 'unknown';

    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable;

    let quality: NetworkQuality;
    if (!isConnected || isInternetReachable === false) {
        quality = NetworkQuality.OFFLINE;
    } else if (connectionType === 'wifi' || connectionType === 'ethernet') {
        quality = NetworkQuality.EXCELLENT;
    } else if (connectionType === 'cellular') {
        quality = NetworkQuality.GOOD;
    } else {
        quality = NetworkQuality.POOR;
    }

    return {
        isConnected,
        type: connectionType,
        quality,
        isInternetReachable,
    };
}

export async function getNetworkState(): Promise<NetworkState> {
    return mapNetInfoState(await NetInfo.fetch());
}

export function getConnectivityStatus(state: NetworkState): networkStatusTypes {
    const isAndroid = Platform.OS === 'android';
    const connected =
        state.isConnected && (isAndroid ? state.isInternetReachable : true);
    return connected
        ? networkStatusTypes.ONLINE
        : networkStatusTypes.DISCONNECTED;
}

export function subscribeToNetworkState(
    callback: (state: NetworkState) => void,
): () => void {
    return NetInfo.addEventListener((state) => {
        callback(mapNetInfoState(state));
    });
}

export function getAdaptiveTimeout(
    baseTimeout: number,
    networkQuality: NetworkQuality,
): number {
    switch (networkQuality) {
        case NetworkQuality.EXCELLENT:
            return baseTimeout;
        case NetworkQuality.GOOD:
            return baseTimeout * 1.5;
        case NetworkQuality.POOR:
            return baseTimeout * 2;
        case NetworkQuality.OFFLINE:
            return baseTimeout * 3;
        default:
            return baseTimeout;
    }
}

export async function isNetworkAvailable(): Promise<boolean> {
    const state = await getNetworkState();
    return state.isConnected && state.isInternetReachable !== false;
}

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
