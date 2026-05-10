/**
 * API Hooks Index
 * 
 * Central export for all API hooks.
 * 
 * Hooks are organized by feature in subdirectories.
 * Old hook files (use-auth.ts, use-users.ts) are kept for reference
 * but not exported to avoid conflicts.
 */

// Auth hooks
export * from './auth';

// User hooks
export * from './users';

// Assessment hooks
export * from './assessments';

// Add more hook exports as you create them:
// export * from './articles';
// etc.

