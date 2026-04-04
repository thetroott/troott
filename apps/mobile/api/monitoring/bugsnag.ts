// /**
//  * Bugsnag Configuration
//  * 
//  * Initialize Bugsnag for error tracking and monitoring.
//  * Configured for React Native Expo.
//  */

// import { getEnvironment } from '@/utils/env.util';
// import Bugsnag from '@bugsnag/expo';


// /**
//  * Initialize Bugsnag
//  * 
//  * Call this in your app entry point (e.g., app/_layout.tsx)
//  * 
//  * @param apiKey - Your Bugsnag API key (get from environment variables)
//  */
// export const initializeBugsnag = (apiKey?: string): void => {
//   const bugsnagApiKey = apiKey || process.env.EXPO_PUBLIC_BUGSNAG_API_KEY;

//   if (!bugsnagApiKey) {
//     console.warn('Bugsnag API key not found. Error tracking disabled.');
//     return;
//   }

//   const environment = getEnvironment();

//   Bugsnag.start({
//     apiKey: bugsnagApiKey,
//     // Only enable in production/staging
//     enabledReleaseStages: environment === 'development' ? [] : ['production', 'staging'],
//     // App version
//     appVersion: require('../../app.json').expo.version,
//     // Auto-capture unhandled errors
//     autoDetectErrors: true,
//     autoTrackSessions: true,
//     // Network breadcrumbs
//     enabledBreadcrumbTypes: [
//       'error',
//       'log',
//       'navigation',
//       'request',
//       'state',
//       'user',
//     ],
//     // Metadata
//     metadata: {
//       app: {
//         environment,
//         platform: 'react-native',
//       },
//     },
//   });

//   // Set default user context (can be updated when user logs in)
//   Bugsnag.setUser(undefined, undefined, undefined);
// };

// /**
//  * Set user context for Bugsnag
//  * 
//  * Call this when user logs in
//  */
// export const setBugsnagUser = (userId: string, email?: string, name?: string): void => {
//   Bugsnag.setUser(userId, email, name);
// };

// /**
//  * Clear user context
//  * 
//  * Call this when user logs out
//  */
// export const clearBugsnagUser = (): void => {
//   Bugsnag.setUser(undefined, undefined, undefined);
// };

// /**
//  * Add breadcrumb manually
//  */
// export const addBreadcrumb = (message: string, metadata?: Record<string, unknown>): void => {
//   Bugsnag.leaveBreadcrumb(message, metadata);
// };

