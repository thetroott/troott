/**
 * API Setup
 * 
 * Initialize all API services (Bugsnag, offline queue, etc.)
 * Call this in your app entry point before rendering.
 */

import { initializeBugsnag } from './monitoring/bugsnag';
import { initializeOfflineQueue } from './services/offline';

/**
 * Initialize all API services
 * 
 * Call this once in your app entry point (app/_layout.tsx)
 * 
 * @param bugsnagApiKey - Optional Bugsnag API key (can also use env var)
 */
export const initializeApi = (bugsnagApiKey?: string): (() => void) => {
  // Initialize Bugsnag
  initializeBugsnag(bugsnagApiKey);

  // Initialize offline queue
  const cleanupOfflineQueue = initializeOfflineQueue();

  // Return cleanup function
  return () => {
    cleanupOfflineQueue();
  };
};

