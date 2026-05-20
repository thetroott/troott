/**
 * Bugsnag Configuration
 * 
 * Initialize Bugsnag for error tracking and monitoring.
 * Configured for React Native Expo.
 */

import { getEnvironment } from '../config/index';

type BugsnagStatic = {
    start: (opts: Record<string, unknown>) => void;
    setUser: (
        id?: string,
        email?: string,
        name?: string,
    ) => void;
    leaveBreadcrumb: (
        message: string,
        metadata?: Record<string, unknown>,
    ) => void;
    notify: (
        error: Error,
        cb?: (event: {
            addMetadata: (section: string, data: Record<string, unknown>) => void;
            setUser: (id: string) => void;
            severity?: string;
        }) => void,
    ) => void;
};

let bugsnagCached: BugsnagStatic | undefined;
let bugsnagLoadFailed = false;

/**
 * Lazily loads @bugsnag/expo so missing native modules (e.g. after adding expo-crypto
 * without rebuilding Android) do not crash the bundle at import time.
 */
export function getBugsnag(): BugsnagStatic | null {
    if (bugsnagLoadFailed) return null;
    if (bugsnagCached) return bugsnagCached;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        bugsnagCached = require('@bugsnag/expo').default as BugsnagStatic;
        return bugsnagCached;
    } catch (e) {
        bugsnagLoadFailed = true;
        if (__DEV__) {
            console.warn(
                '[Bugsnag] Native client unavailable. Rebuild the dev client (expo run:android / run:ios) after native dependency changes:',
                e,
            );
        }
        return null;
    }
}

/**
 * Initialize Bugsnag
 * 
 * Call this in your app entry point (e.g., app/_layout.tsx)
 * 
 * @param apiKey - Your Bugsnag API key (get from environment variables)
 */
export const initializeBugsnag = (apiKey?: string): void => {
    const bugsnagApiKey = apiKey || process.env.EXPO_PUBLIC_BUGSNAG_API_KEY;

    if (!bugsnagApiKey) {
        console.warn('Bugsnag API key not found. Error tracking disabled.');
        return;
    }

    const Bugsnag = getBugsnag();
    if (!Bugsnag) {
        return;
    }

    const environment = getEnvironment();

    Bugsnag.start({
        apiKey: bugsnagApiKey,
        // Only enable in production/staging
        enabledReleaseStages:
            environment === 'development' ? [] : ['production', 'staging'],
        // App version
        appVersion: require('../../app.json').expo.version,
        // Auto-capture unhandled errors
        autoDetectErrors: true,
        autoTrackSessions: true,
        // Network breadcrumbs
        enabledBreadcrumbTypes: [
            'error',
            'log',
            'navigation',
            'request',
            'state',
            'user',
        ],
        // Metadata
        metadata: {
            app: {
                environment,
                platform: 'react-native',
            },
        },
    });

    // Set default user context (can be updated when user logs in)
    Bugsnag.setUser(undefined, undefined, undefined);
};

/**
 * Set user context for Bugsnag
 * 
 * Call this when user logs in
 */
export const setBugsnagUser = (
    userId: string,
    email?: string,
    name?: string,
): void => {
    getBugsnag()?.setUser(userId, email, name);
};

/**
 * Clear user context
 * 
 * Call this when user logs out
 */
export const clearBugsnagUser = (): void => {
    getBugsnag()?.setUser(undefined, undefined, undefined);
};

/**
 * Add breadcrumb manually
 */
export const addBreadcrumb = (
    message: string,
    metadata?: Record<string, unknown>,
): void => {
    getBugsnag()?.leaveBreadcrumb(message, metadata);
};

