/**
 * Network Utilities
 * 
 * Network status monitoring, connection quality detection,
 * and adaptive timeout/retry strategies based on network conditions.
 */

import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';

/**
 * Network connection types
 */
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';

/**
 * Network quality levels
 */
export enum NetworkQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  POOR = 'poor',
  OFFLINE = 'offline',
}

/**
 * Network state interface
 */
export interface NetworkState {
  isConnected: boolean;
  type: ConnectionType;
  quality: NetworkQuality;
  isInternetReachable: boolean | null;
}

/**
 * Get current network state
 */
export const getNetworkState = async (): Promise<NetworkState> => {
  const state = await NetInfo.fetch();
  
  const connectionType: ConnectionType = 
    state.type === NetInfoStateType.wifi ? 'wifi' :
    state.type === NetInfoStateType.cellular ? 'cellular' :
    state.type === NetInfoStateType.ethernet ? 'ethernet' :
    state.type === NetInfoStateType.none ? 'none' :
    'unknown';

  const isConnected = state.isConnected ?? false;
  const isInternetReachable = state.isInternetReachable;

  // Determine network quality based on connection type and reachability
  let quality: NetworkQuality;
  if (!isConnected || isInternetReachable === false) {
    quality = NetworkQuality.OFFLINE;
  } else if (connectionType === 'wifi' || connectionType === 'ethernet') {
    quality = NetworkQuality.EXCELLENT;
  } else if (connectionType === 'cellular') {
    // Could be enhanced with actual speed detection
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
};

/**
 * Subscribe to network state changes
 * 
 * @param callback - Function called when network state changes
 * @returns Unsubscribe function
 */
export const subscribeToNetworkState = (
  callback: (state: NetworkState) => void
): (() => void) => {
  return NetInfo.addEventListener((state) => {
    const connectionType: ConnectionType = 
      state.type === NetInfoStateType.wifi ? 'wifi' :
      state.type === NetInfoStateType.cellular ? 'cellular' :
      state.type === NetInfoStateType.ethernet ? 'ethernet' :
      state.type === NetInfoStateType.none ? 'none' :
      'unknown';

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

    callback({
      isConnected,
      type: connectionType,
      quality,
      isInternetReachable,
    });
  });
};

/**
 * Get adaptive timeout based on network quality
 * 
 * @param baseTimeout - Base timeout in milliseconds
 * @param networkQuality - Current network quality
 * @returns Adjusted timeout
 */
export const getAdaptiveTimeout = (
  baseTimeout: number,
  networkQuality: NetworkQuality
): number => {
  switch (networkQuality) {
    case NetworkQuality.EXCELLENT:
      return baseTimeout; // Use base timeout
    case NetworkQuality.GOOD:
      return baseTimeout * 1.5; // 50% more time
    case NetworkQuality.POOR:
      return baseTimeout * 2; // Double the timeout
    case NetworkQuality.OFFLINE:
      return baseTimeout * 3; // Triple for offline scenarios
    default:
      return baseTimeout;
  }
};

/**
 * Check if network is available
 */
export const isNetworkAvailable = async (): Promise<boolean> => {
  const state = await getNetworkState();
  return state.isConnected && state.isInternetReachable !== false;
};

/**
 * Wait for network to become available
 * 
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise that resolves when network is available or rejects on timeout
 */
export const waitForNetwork = (timeout = 30000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkNetwork = async () => {
      const available = await isNetworkAvailable();
      
      if (available) {
        resolve();
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error('Network wait timeout'));
        return;
      }

      // Check again after 1 second
      setTimeout(checkNetwork, 1000);
    };

    checkNetwork();
  });
};

